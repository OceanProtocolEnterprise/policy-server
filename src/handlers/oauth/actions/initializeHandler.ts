import { AuthType } from '../../../@types/auth'
import { IPolicyHandler } from '../../../@types/policyHandler.js'
import {
  PolicyActionType,
  PolicyRequestPayload,
  PolicyRequestResponse
} from '../../../@types/request'

export class OauthInitializeHandler implements IPolicyHandler {
  supportAuthType(authType: AuthType): boolean {
    return authType === 'oauth'
  }

  supportActionType(policyActionType: PolicyActionType): boolean {
    return policyActionType === 'initialize'
  }

  execute(requestPayload: PolicyRequestPayload): PolicyRequestResponse {
    return { success: true, message: 'oauth:initialize', httpStatus: 200 }
  }
}
