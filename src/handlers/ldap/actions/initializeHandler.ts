import { AuthType } from '../../../@types/auth'
import { IPolicyHandler } from '../../../@types/policyHandler.js'
import {
  PolicyActionType,
  PolicyRequestPayload,
  PolicyRequestResponse
} from '../../../@types/request'

export class LdapInitializeHandler implements IPolicyHandler {
  supportAuthType(authType: AuthType): boolean {
    return authType === 'ldap'
  }

  supportActionType(policyActionType: PolicyActionType): boolean {
    return policyActionType === 'initialize'
  }

  // eslint-disable-next-line require-await
  async execute(requestPayload: PolicyRequestPayload): Promise<PolicyRequestResponse> {
    throw new Error('not implemented')
  }
}
