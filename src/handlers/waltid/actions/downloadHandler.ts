import { AuthType } from '../../../@types/auth'
import { IPolicyHandler } from '../../../@types/policyHandler'
import {
  PolicyActionType,
  PolicyRequestPayload,
  PolicyRequestResponse
} from '../../../@types/request'

export class WaltIdDownloadHandler implements IPolicyHandler {
  supportAuthType(authType: AuthType): boolean {
    return authType === 'waltid'
  }

  supportActionType(policyActionType: PolicyActionType): boolean {
    return policyActionType === 'download'
  }

  execute(requestPayload: PolicyRequestPayload): PolicyRequestResponse {
    return { success: true, message: 'waltId:download', httpStatus: 200 }
  }
}
