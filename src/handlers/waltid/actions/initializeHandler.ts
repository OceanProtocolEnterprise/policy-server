import axios from 'axios'
import {
  AuthType,
  IPolicyHandler,
  PolicyActionType,
  PolicyRequestPayload,
  PolicyRequestResponse
} from '../../../@types/PolicyServer/policyServerTypes'
import { DDO } from '../../../@types/DDO/DDO'
import { buildInvalidRequestMessage } from '../../../utils/validateRequests.js'

export class WaltIdInitializeHandler implements IPolicyHandler {
  supportAuthType(authType: AuthType): boolean {
    return authType === 'waltid'
  }

  supportActionType(policyActionType: PolicyActionType): boolean {
    return policyActionType === 'initialize'
  }

  async execute(requestPayload: PolicyRequestPayload): Promise<PolicyRequestResponse> {
    if (!requestPayload.ddo.credentials.allow)
      return buildInvalidRequestMessage(
        'Request body does not contain ddo.credentials.allow'
      )
    const url = `${process.env.WALTID_VERIFIER_URL}/openid4vc/verify`

    const ddo = requestPayload.ddo as DDO
    const body = {
      vc_policies: requestPayload.policyServer.vc_policies ?? [],
      request_credentials: ddo.credentials.allow.map((credential: any) => ({
        format: 'jwt_vc_json',
        type: credential.type
      }))
    }
    const response = await axios.post(url, body)

    return {
      success: response.status === 200,
      message: response.data,
      httpStatus: response.status
    }
  }
}
