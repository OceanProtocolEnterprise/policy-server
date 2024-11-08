import { AuthType } from '../../../@types/auth'
import { IPolicyHandler } from '../../../@types/policyHandler'
import {
  PolicyActionType,
  PolicyRequestPayload,
  PolicyRequestResponse
} from '../../../@types/request'

export class OauthDownloadHandler implements IPolicyHandler {
  supportAuthType(authType: AuthType): boolean {
    return authType === 'oauth'
  }

  supportActionType(policyActionType: PolicyActionType): boolean {
    return policyActionType === 'download'
  }

  execute(requestPayload: PolicyRequestPayload): PolicyRequestResponse {
    return { success: true, message: 'waltId:download', httpStatus: 200 }
  }
}
