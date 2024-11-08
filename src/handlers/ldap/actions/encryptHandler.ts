import { AuthType } from '../../../@types/auth'
import { IPolicyHandler } from '../../../@types/policyHandler'
import {
  PolicyActionType,
  PolicyRequestPayload,
  PolicyRequestResponse
} from '../../../@types/request'

export class LdapEncryptHandler implements IPolicyHandler {
  supportAuthType(authType: AuthType): boolean {
    return authType === 'ldap'
  }

  supportActionType(policyActionType: PolicyActionType): boolean {
    return policyActionType === 'encrypt'
  }

  execute(requestPayload: PolicyRequestPayload): PolicyRequestResponse {
    throw new Error('not implemented')
  }
}
