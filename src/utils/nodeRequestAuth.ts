import axios from 'axios'
import { PolicyRequestPayload, PolicyRequestResponse } from '../@types/policy.js'
import { logWarn } from './logger.js'

const WEB3_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/
const NODE_ACCESS_LIST_ENV = 'POLICY_SERVER_NODE_ACCESS_LIST'
const NODE_ACCESS_LIST_URL_ENV = 'POLICY_SERVER_NODE_ACCESS_LIST_URL'
const CONSUMER_ACCESS_LIST_ENV = 'POLICY_SERVER_CONSUMER_ACCESS_LIST'
const CONSUMER_ACCESS_LIST_URL_ENV = 'POLICY_SERVER_CONSUMER_ACCESS_LIST_URL'
const CONSUMER_GUARDED_ACTIONS = new Set([
  'initiate',
  'download',
  'startCompute',
  'encrypt',
  'decrypt',
  'validateDDO'
])

export type AccessListAuthorizer = {
  isAllowed(address: string): boolean | Promise<boolean>
}

export type RequestAuthenticator = {
  authenticate(payload: PolicyRequestPayload): Promise<PolicyRequestResponse | null>
}

type AddressAccessListStoreOptions = {
  addressesEnvVar: string
  urlEnvVar: string
}

class EnvAddressAccessListStore implements AccessListAuthorizer {
  private addresses = new Map<string, string>()
  private readonly addressesEnvVar: string
  private readonly urlEnvVar: string

  public constructor(options: AddressAccessListStoreOptions) {
    this.addressesEnvVar = options.addressesEnvVar
    this.urlEnvVar = options.urlEnvVar
    this.setAddresses(parseAddressAccessList(process.env[this.addressesEnvVar]))
  }

  public getAddresses(): string[] {
    return Array.from(this.addresses.values())
  }

  public isEnabled(): boolean {
    return this.addresses.size > 0
  }

  public setAddresses(addresses: string[]): void {
    this.addresses = new Map(
      normalizeWeb3Addresses(addresses).map((address) => [address, address])
    )
  }

  public async reloadFromEnvironment(): Promise<string[]> {
    const inlineAddresses = parseAddressAccessList(process.env[this.addressesEnvVar])
    const remoteAddresses = await loadAddressAccessListFromUrl(
      process.env[this.urlEnvVar]
    )
    const mergedAddresses = dedupeAddresses([...inlineAddresses, ...remoteAddresses])

    this.setAddresses(mergedAddresses)
    return this.getAddresses()
  }

  public isAllowed(address: string): boolean {
    if (!this.isEnabled()) return true
    return this.addresses.has(address.toLowerCase())
  }
}

export class EnvNodeAccessListStore extends EnvAddressAccessListStore {
  public constructor() {
    super({
      addressesEnvVar: NODE_ACCESS_LIST_ENV,
      urlEnvVar: NODE_ACCESS_LIST_URL_ENV
    })
  }

  public static fromEnvironment(): EnvNodeAccessListStore {
    if (!sharedEnvNodeAccessListStore) {
      sharedEnvNodeAccessListStore = new EnvNodeAccessListStore()
    }
    return sharedEnvNodeAccessListStore
  }

  public static resetSharedFromEnvironment(): EnvNodeAccessListStore {
    sharedEnvNodeAccessListStore = new EnvNodeAccessListStore()
    return sharedEnvNodeAccessListStore
  }

  public static async reloadSharedFromEnvironment(): Promise<EnvNodeAccessListStore> {
    const store = EnvNodeAccessListStore.fromEnvironment()
    await store.reloadFromEnvironment()
    return store
  }
}

export class EnvConsumerAccessListStore extends EnvAddressAccessListStore {
  public constructor() {
    super({
      addressesEnvVar: CONSUMER_ACCESS_LIST_ENV,
      urlEnvVar: CONSUMER_ACCESS_LIST_URL_ENV
    })
  }

  public static fromEnvironment(): EnvConsumerAccessListStore {
    if (!sharedEnvConsumerAccessListStore) {
      sharedEnvConsumerAccessListStore = new EnvConsumerAccessListStore()
    }
    return sharedEnvConsumerAccessListStore
  }

  public static resetSharedFromEnvironment(): EnvConsumerAccessListStore {
    sharedEnvConsumerAccessListStore = new EnvConsumerAccessListStore()
    return sharedEnvConsumerAccessListStore
  }

  public static async reloadSharedFromEnvironment(): Promise<EnvConsumerAccessListStore> {
    const store = EnvConsumerAccessListStore.fromEnvironment()
    await store.reloadFromEnvironment()
    return store
  }
}

class AddressRequestAuthenticator implements RequestAuthenticator {
  private readonly accessListAuthorizer: AccessListAuthorizer
  private readonly addressField: 'nodeAddress' | 'consumerAddress' | 'publisherAddress'
  private readonly subjectName: 'Node' | 'Consumer'
  private readonly isEnabled: () => boolean
  private readonly shouldAuthenticate: (payload: PolicyRequestPayload) => boolean
  private readonly getRawAddress: (payload: PolicyRequestPayload) => string | undefined
  private readonly getExpectedAddressField: (
    payload: PolicyRequestPayload
  ) => 'nodeAddress' | 'consumerAddress' | 'publisherAddress'

  public constructor(options: {
    accessListAuthorizer: AccessListAuthorizer
    addressField: 'nodeAddress' | 'consumerAddress' | 'publisherAddress'
    subjectName: 'Node' | 'Consumer'
    isEnabled: () => boolean
    shouldAuthenticate?: (payload: PolicyRequestPayload) => boolean
    getRawAddress?: (payload: PolicyRequestPayload) => string | undefined
    getExpectedAddressField?: (
      payload: PolicyRequestPayload
    ) => 'nodeAddress' | 'consumerAddress' | 'publisherAddress'
  }) {
    this.accessListAuthorizer = options.accessListAuthorizer
    this.addressField = options.addressField
    this.subjectName = options.subjectName
    this.isEnabled = options.isEnabled
    this.shouldAuthenticate = options.shouldAuthenticate ?? (() => true)
    this.getRawAddress =
      options.getRawAddress ??
      ((payload) => payload[this.addressField] as string | undefined)
    this.getExpectedAddressField =
      options.getExpectedAddressField ?? (() => this.addressField)
  }

  public async authenticate(
    payload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse | null> {
    if (!this.isEnabled() || !this.shouldAuthenticate(payload)) return null

    const { action } = payload

    if (!action) {
      return buildFailureResponse(400, 'Missing action in request body.')
    }

    const rawAddress = this.getRawAddress(payload)
    if (!rawAddress) {
      const expectedAddressField = this.getExpectedAddressField(payload)
      return buildFailureResponse(
        401,
        `Missing ${this.subjectName.toLowerCase()} authorization fields. Expected ${expectedAddressField}.`
      )
    }

    let normalizedAddress: string
    try {
      normalizedAddress = normalizeStrictWeb3Address(rawAddress)
    } catch {
      return buildFailureResponse(
        401,
        `Invalid ${this.subjectName.toLowerCase()}Address format.`
      )
    }

    try {
      const allowed = await this.accessListAuthorizer.isAllowed(normalizedAddress)
      if (!allowed) {
        return buildFailureResponse(
          403,
          `${this.subjectName} ${normalizedAddress} is not authorized by the configured access list.`
        )
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Failed to validate ${this.subjectName.toLowerCase()} access list.`
      return buildFailureResponse(500, message)
    }

    return null
  }
}

export class NodeRequestAuthenticator extends AddressRequestAuthenticator {
  public constructor(
    enabled: boolean,
    accessListAuthorizer: AccessListAuthorizer,
    isEnabled: () => boolean = () => enabled
  ) {
    super({
      accessListAuthorizer,
      addressField: 'nodeAddress',
      subjectName: 'Node',
      isEnabled
    })
  }

  public static fromEnvironment(): NodeRequestAuthenticator {
    const accessListStore = EnvNodeAccessListStore.fromEnvironment()

    return new NodeRequestAuthenticator(true, accessListStore, () =>
      accessListStore.isEnabled()
    )
  }
}

export class ConsumerRequestAuthenticator extends AddressRequestAuthenticator {
  public constructor(
    enabled: boolean,
    accessListAuthorizer: AccessListAuthorizer,
    isEnabled: () => boolean = () => enabled
  ) {
    super({
      accessListAuthorizer,
      addressField: 'consumerAddress',
      subjectName: 'Consumer',
      isEnabled,
      shouldAuthenticate: (payload) => CONSUMER_GUARDED_ACTIONS.has(payload.action),
      getRawAddress: (payload) =>
        payload.action === 'validateDDO'
          ? payload.publisherAddress
          : payload.consumerAddress,
      getExpectedAddressField: (payload) =>
        payload.action === 'validateDDO' ? 'publisherAddress' : 'consumerAddress'
    })
  }

  public static fromEnvironment(): ConsumerRequestAuthenticator {
    const accessListStore = EnvConsumerAccessListStore.fromEnvironment()

    return new ConsumerRequestAuthenticator(true, accessListStore, () =>
      accessListStore.isEnabled()
    )
  }
}

export class PolicyRequestAuthenticator implements RequestAuthenticator {
  private readonly authenticators: RequestAuthenticator[]

  public constructor(authenticators: RequestAuthenticator[]) {
    this.authenticators = authenticators
  }

  public static fromEnvironment(): PolicyRequestAuthenticator {
    return new PolicyRequestAuthenticator([
      NodeRequestAuthenticator.fromEnvironment(),
      ConsumerRequestAuthenticator.fromEnvironment()
    ])
  }

  public async authenticate(
    payload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse | null> {
    for (const authenticator of this.authenticators) {
      const response = await authenticator.authenticate(payload)
      if (response) return response
    }

    return null
  }
}

export async function initializeSharedAccessListStoresFromEnvironment(): Promise<void> {
  await Promise.all([
    EnvNodeAccessListStore.reloadSharedFromEnvironment(),
    EnvConsumerAccessListStore.reloadSharedFromEnvironment()
  ])
}

export function parseAddressAccessList(rawValue: string | undefined): string[] {
  if (!rawValue?.trim()) return []

  return rawValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function parseAddressAccessListFromText(rawValue: string): string[] {
  if (!rawValue.trim()) return []

  return rawValue
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function normalizeNodeAddresses(addresses: string[]): string[] {
  return normalizeWeb3Addresses(addresses)
}

export function normalizeNodeAddress(address: string): string {
  return normalizeStrictWeb3Address(address)
}

export function normalizeConsumerAddresses(addresses: string[]): string[] {
  return normalizeWeb3Addresses(addresses)
}

export function normalizeConsumerAddress(address: string): string {
  return normalizeStrictWeb3Address(address)
}

async function loadAddressAccessListFromUrl(
  urlValue: string | undefined
): Promise<string[]> {
  if (!urlValue?.trim()) return []

  const response = await axios.get<string>(urlValue.trim(), {
    responseType: 'text',
    transformResponse: [(data) => data]
  })

  return parseAddressAccessListFromText(response.data)
}

function normalizeWeb3Addresses(addresses: string[]): string[] {
  return addresses.flatMap((address) => {
    const normalizedAddress = normalizeWeb3Address(address)
    return normalizedAddress ? [normalizedAddress] : []
  })
}

function normalizeStrictWeb3Address(address: string): string {
  const trimmedAddress = address.trim()
  if (!WEB3_ADDRESS_PATTERN.test(trimmedAddress)) {
    throw new Error('Invalid web3 address format.')
  }

  return trimmedAddress.toLowerCase()
}

function normalizeWeb3Address(address: string): string | null {
  const trimmedAddress = address.trim()
  if (!WEB3_ADDRESS_PATTERN.test(trimmedAddress)) {
    logWarn(`Skipping invalid web3 address in access list: ${address}`)
    return null
  }

  return trimmedAddress.toLowerCase()
}

function dedupeAddresses(addresses: string[]): string[] {
  return Array.from(new Set(normalizeWeb3Addresses(addresses)))
}

function buildFailureResponse(
  httpStatus: number,
  message: string
): PolicyRequestResponse {
  return {
    success: false,
    message,
    httpStatus
  }
}

let sharedEnvNodeAccessListStore: EnvNodeAccessListStore | undefined
let sharedEnvConsumerAccessListStore: EnvConsumerAccessListStore | undefined
