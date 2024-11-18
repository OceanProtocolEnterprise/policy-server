import axios from 'axios'
import {
  AuthType,
  IPolicyHandler,
  PolicyActionType,
  PolicyRequestPayload,
  PolicyRequestResponse
} from '../../../@types/PolicyServer/policyServerTypes'
// import { DDO } from '../../../@types/DDO/DDO'

export class WaltIdInitializeHandler implements IPolicyHandler {
  supportAuthType(authType: AuthType): boolean {
    return authType === 'waltid'
  }

  supportActionType(policyActionType: PolicyActionType): boolean {
    return policyActionType === 'initialize'
  }

  async execute(requestPayload: PolicyRequestPayload): Promise<PolicyRequestResponse> {
    const url = `${process.env.WALTID_VERIFIER_URL}/openid4vc/verify`

    // const ddo = requestPayload.ddo as DDO
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
