import { AuthType } from '../../../@types/auth'
import { IPolicyHandler } from '../../../@types/policyHandler'
import {
  PolicyActionType,
  PolicyRequestPayload,
  PolicyRequestResponse
} from '../../../@types/request'

export class LdapDownloadHandler implements IPolicyHandler {
  supportAuthType(authType: AuthType): boolean {
    return authType === 'ldap'
  }

  supportActionType(policyActionType: PolicyActionType): boolean {
    return policyActionType === 'download'
  }

  // eslint-disable-next-line require-await
  async execute(requestPayload: PolicyRequestPayload): Promise<PolicyRequestResponse> {
    throw new Error('not implemented')
  }
}
