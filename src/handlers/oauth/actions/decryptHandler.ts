import { AuthType } from '../../../@types/auth'
import { IPolicyHandler } from '../../../@types/policyHandler'
import {
  PolicyActionType,
  PolicyRequestPayload,
  PolicyRequestResponse
} from '../../../@types/request'

export class OauthDecryptHandler implements IPolicyHandler {
  supportAuthType(authType: AuthType): boolean {
    return authType === 'oauth'
  }

  supportActionType(policyActionType: PolicyActionType): boolean {
    return policyActionType === 'decrypt'
  }

  // eslint-disable-next-line require-await
  async execute(requestPayload: PolicyRequestPayload): Promise<PolicyRequestResponse> {
    throw new Error('not implemented')
  }
}
