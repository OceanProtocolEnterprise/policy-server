import { PolicyRequestPayload, PolicyRequestResponse } from '../@types/policy.js'

const NODE_ACCESS_LIST_ENV = 'POLICY_SERVER_NODE_ACCESS_LIST'
const NODE_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/

export type AccessListAuthorizer = {
  isAllowed(nodeAddress: string): boolean
}

export class EnvNodeAccessListStore implements AccessListAuthorizer {
  private addresses = new Map<string, string>()

  public constructor(addresses = parseNodeAccessList(process.env[NODE_ACCESS_LIST_ENV])) {
    this.setAddresses(addresses)
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

  public getAddresses(): string[] {
    return Array.from(this.addresses.values())
  }

  public setAddresses(addresses: string[]): void {
    this.addresses = new Map(
      normalizeNodeAddresses(addresses).map((address) => [address.toLowerCase(), address])
    )
    process.env[NODE_ACCESS_LIST_ENV] = this.getAddresses().join(',')
  }

  public isAllowed(nodeAddress: string): boolean {
    if (this.addresses.size === 0) return true
    return this.addresses.has(nodeAddress.toLowerCase())
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

  public async authenticate(
    payload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse | null> {
    if (!this.isEnabled()) return null

    const { action, nodeAddress } = payload

    if (!action) {
      return this.buildFailureResponse(400, 'Missing action in request body.')
    }

    if (!nodeAddress) {
      return this.buildFailureResponse(
        401,
        'Missing node authorization fields. Expected nodeAddress.'
      )
    }

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

export function parseNodeAccessList(rawValue: string | undefined): string[] {
  if (!rawValue?.trim()) return []

  return rawValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function normalizeNodeAddresses(addresses: string[]): string[] {
  return addresses.map((address) => normalizeNodeAddress(address))
}

export function normalizeNodeAddress(address: string): string {
  const trimmedAddress = address.trim()
  if (!NODE_ADDRESS_PATTERN.test(trimmedAddress)) {
    throw new Error('Invalid node address format.')
  }

  return trimmedAddress.toLowerCase()
}

let sharedEnvNodeAccessListStore: EnvNodeAccessListStore | undefined
