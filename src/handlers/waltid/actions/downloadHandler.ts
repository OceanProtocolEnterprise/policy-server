import axios from 'axios'
import {
  AuthType,
  IPolicyHandler,
  PolicyActionType,
  PolicyRequestPayload,
  PolicyRequestResponse
} from '../../../@types/PolicyServer/policyServerTypes'
import { buildInvalidRequestMessage } from '../../../utils/validateRequests.js'

export class WaltIdDownloadHandler implements IPolicyHandler {
  supportAuthType(authType: AuthType): boolean {
    return authType === 'waltid'
  }

  supportActionType(policyActionType: PolicyActionType): boolean {
    return policyActionType === 'download'
  }

  async execute(requestPayload: PolicyRequestPayload): Promise<PolicyRequestResponse> {
    if (!requestPayload.policyServer.sessionId)
      return buildInvalidRequestMessage(
        'Request body does not contain policyServer.sessionId'
      )

    const url = `${process.env.WALTID_VERIFIER_URL}/openid4vc/session/${requestPayload.policyServer.sessionId}`

    const response = await axios.get(url)
    return {
      success: response.status === 200,
      message: response.data,
      httpStatus: response.status
    }
  }
}
