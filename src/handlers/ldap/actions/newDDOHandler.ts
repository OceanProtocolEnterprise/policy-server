import {
  AuthType,
  IPolicyHandler,
  PolicyActionType,
  PolicyRequestPayload,
  PolicyRequestResponse
} from '../../../@types/PolicyServer/policyServerTypes'
import { buildNotImplementedRequestMessage } from '../../../utils/validateRequests.js'

export class LdapNewDDOHandler implements IPolicyHandler {
  supportAuthType(authType: AuthType): boolean {
    return authType === 'ldap'
  }

  supportActionType(policyActionType: PolicyActionType): boolean {
    return policyActionType === 'newDDO'
  }

  // eslint-disable-next-line require-await
  async execute(requestPayload: PolicyRequestPayload): Promise<PolicyRequestResponse> {
    return buildNotImplementedRequestMessage()
  }
}
