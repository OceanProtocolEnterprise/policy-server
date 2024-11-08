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

  execute(requestPayload: PolicyRequestPayload): PolicyRequestResponse {
    return { success: true, message: 'waltId:initialize', httpStatus: 200 }
  }
}
