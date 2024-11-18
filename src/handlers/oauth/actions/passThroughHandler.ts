import {
  AuthType,
  IPolicyHandler,
  PolicyActionType,
  PolicyRequestPayload,
  PolicyRequestResponse
} from '../../../@types/PolicyServer/policyServerTypes'
import { buildNotImplementedRequestMessage } from '../../../utils/validateRequests.js'

export class OauthPassThroughHandler implements IPolicyHandler {
  supportAuthType(authType: AuthType): boolean {
    return authType === 'oauth'
  }

  supportActionType(policyActionType: PolicyActionType): boolean {
    return policyActionType === 'passthrough'
  }

  // eslint-disable-next-line require-await
  async execute(requestPayload: PolicyRequestPayload): Promise<PolicyRequestResponse> {
    return buildNotImplementedRequestMessage()
  }
}
