import { PolicyRequestPayload, PolicyRequestResponse } from '../@types/policy.js'

const ETHEREUM_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/
const NODE_ACCESS_LIST_ENV = 'POLICY_SERVER_NODE_ACCESS_LIST'
const CONSUMER_ACCESS_LIST_ENV = 'POLICY_SERVER_CONSUMER_ACCESS_LIST'

export type AccessListAuthorizer = {
  isAllowed(address: string): boolean | Promise<boolean>
}

class EnvAccessListStore implements AccessListAuthorizer {
  private addresses = new Map<string, string>()

  public constructor(
    private readonly envVarName: string,
    addresses = parseAccessList(process.env[envVarName])
  ) {
    this.setAddresses(addresses)
  }

  public getAddresses(): string[] {
    return Array.from(this.addresses.values())
  }

  public setAddresses(addresses: string[]): void {
    this.addresses = new Map(
      normalizeAddresses(addresses).map((address) => [address.toLowerCase(), address])
    )
    process.env[this.envVarName] = this.getAddresses().join(',')
  }

  public isAllowed(address: string): boolean {
    if (this.addresses.size === 0) return true
    return this.addresses.has(address.toLowerCase())
  }
}

export class EnvNodeAccessListStore extends EnvAccessListStore {
  public constructor(addresses = parseNodeAccessList(process.env[NODE_ACCESS_LIST_ENV])) {
    super(NODE_ACCESS_LIST_ENV, addresses)
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
}

export class EnvConsumerAccessListStore extends EnvAccessListStore {
  public constructor(
    addresses = parseConsumerAccessList(process.env[CONSUMER_ACCESS_LIST_ENV])
  ) {
    super(CONSUMER_ACCESS_LIST_ENV, addresses)
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
}

export class NodeRequestAuthenticator {
  private readonly accessListAuthorizer: AccessListAuthorizer
  private readonly isEnabled: () => boolean

  public constructor(
    enabled: boolean,
    accessListAuthorizer: AccessListAuthorizer,
    isEnabled: () => boolean = () => enabled
  ) {
    this.accessListAuthorizer = accessListAuthorizer
    this.isEnabled = isEnabled
  }

  public static fromEnvironment(): NodeRequestAuthenticator {
    const accessListStore = EnvNodeAccessListStore.fromEnvironment()

    return new NodeRequestAuthenticator(
      true,
      accessListStore,
      () => accessListStore.getAddresses().length > 0
    )
  }

  public authenticate(
    payload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse | null> {
    if (!this.isEnabled()) return Promise.resolve(null)

    const { action, nodeAddress } = payload

    if (!action) {
      return Promise.resolve(
        this.buildFailureResponse(400, 'Missing action in request body.')
      )
    }

    if (!nodeAddress) {
      return Promise.resolve(
        this.buildFailureResponse(
          401,
          'Missing node authorization fields. Expected nodeAddress.'
        )
      )
    }

    return this.authenticateNodeAddress(nodeAddress)
  }

  public async authenticateNodeAddress(
    nodeAddress: string
  ): Promise<PolicyRequestResponse | null> {
    let normalizedAddress: string
    try {
      normalizedAddress = normalizeNodeAddress(nodeAddress)
    } catch {
      return this.buildFailureResponse(401, 'Invalid nodeAddress format.')
    }

    try {
      const allowed = await this.accessListAuthorizer.isAllowed(normalizedAddress)
      if (!allowed) {
        return this.buildFailureResponse(
          403,
          `Node ${normalizedAddress} is not authorized by the configured access list.`
        )
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to validate node access list.'
      return this.buildFailureResponse(500, message)
    }

    return null
  }

  private buildFailureResponse(
    httpStatus: number,
    message: string
  ): PolicyRequestResponse {
    return {
      success: false,
      message,
      httpStatus
    }
  }
}

export class ConsumerRequestAuthenticator {
  private readonly accessListAuthorizer: AccessListAuthorizer
  private readonly isEnabled: () => boolean

  public constructor(
    enabled: boolean,
    accessListAuthorizer: AccessListAuthorizer,
    isEnabled: () => boolean = () => enabled
  ) {
    this.accessListAuthorizer = accessListAuthorizer
    this.isEnabled = isEnabled
  }

  public static fromEnvironment(): ConsumerRequestAuthenticator {
    const accessListStore = EnvConsumerAccessListStore.fromEnvironment()

    return new ConsumerRequestAuthenticator(
      true,
      accessListStore,
      () => accessListStore.getAddresses().length > 0
    )
  }

  public async authenticateConsumerAddress(
    consumerAddress: string
  ): Promise<PolicyRequestResponse | null> {
    if (!this.isEnabled()) return null

    let normalizedAddress: string
    try {
      normalizedAddress = normalizeConsumerAddress(consumerAddress)
    } catch {
      return this.buildFailureResponse(401, 'Invalid consumerAddress format.')
    }

    try {
      const allowed = await this.accessListAuthorizer.isAllowed(normalizedAddress)
      if (!allowed) {
        return this.buildFailureResponse(
          403,
          `Consumer ${normalizedAddress} is not authorized by the configured access list.`
        )
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to validate consumer access list.'
      return this.buildFailureResponse(500, message)
    }

    return null
  }

  private buildFailureResponse(
    httpStatus: number,
    message: string
  ): PolicyRequestResponse {
    return {
      success: false,
      message,
      httpStatus
    }
  }
}

export function parseAccessList(rawValue: string | undefined): string[] {
  if (!rawValue?.trim()) return []

  return rawValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function parseNodeAccessList(rawValue: string | undefined): string[] {
  return parseAccessList(rawValue)
}

export function parseConsumerAccessList(rawValue: string | undefined): string[] {
  return parseAccessList(rawValue)
}

export function normalizeAddresses(addresses: string[]): string[] {
  return addresses.map((address) => normalizeAddress(address))
}

export function normalizeNodeAddresses(addresses: string[]): string[] {
  return normalizeAddresses(addresses)
}

export function normalizeConsumerAddresses(addresses: string[]): string[] {
  return normalizeAddresses(addresses)
}

export function normalizeAddress(address: string): string {
  const trimmedAddress = address.trim()
  if (!ETHEREUM_ADDRESS_PATTERN.test(trimmedAddress)) {
    throw new Error('Invalid address format.')
  }

  return trimmedAddress.toLowerCase()
}

export function normalizeNodeAddress(address: string): string {
  return normalizeAddress(address)
}

export function normalizeConsumerAddress(address: string): string {
  return normalizeAddress(address)
}

let sharedEnvNodeAccessListStore: EnvNodeAccessListStore | undefined
let sharedEnvConsumerAccessListStore: EnvConsumerAccessListStore | undefined
