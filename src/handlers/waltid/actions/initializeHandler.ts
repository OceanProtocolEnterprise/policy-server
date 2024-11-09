import axios from 'axios'
import { AuthType } from '../../../@types/auth'
import { IPolicyHandler } from '../../../@types/policyHandler.js'
import {
  PolicyActionType,
  PolicyRequestPayload,
  PolicyRequestResponse
} from '../../../@types/request'

export class WaltIdInitializeHandler implements IPolicyHandler {
  supportAuthType(authType: AuthType): boolean {
    return authType === 'waltid'
  }

  supportActionType(policyActionType: PolicyActionType): boolean {
    return policyActionType === 'initialize'
  }

  async execute(requestPayload: PolicyRequestPayload): Promise<PolicyRequestResponse> {
    const url = `${process.env.WALTID_VERIFIER_URL}/openid4vc/verify`

    // TBD: Temporary hardcoded
    const body = {
      request_credentials: [
        {
          format: 'jwt_vc_json',
          type: 'OpenBadgeCredential'
        }
      ]
    }
    const response = await axios.post(url, body)

    return {
      success: response.status === 200,
      message: response.data,
      httpStatus: response.status
    }
  }
}
