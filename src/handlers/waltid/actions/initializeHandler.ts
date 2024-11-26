import axios from 'axios'
import {
  AuthType,
  IPolicyHandler,
  PolicyActionType,
  PolicyRequestPayload,
  PolicyRequestResponse
} from '../../../@types/PolicyServer/policyServerTypes'
import { buildInvalidRequestMessage } from '../../../utils/validateRequests.js'
import { parseRequestCredentials } from '../../../utils/credentialParser.js'
import { randomUUID } from 'crypto'

export class WaltIdInitializeHandler implements IPolicyHandler {
  supportAuthType(authType: AuthType): boolean {
    return authType === 'waltid'
  }

  supportActionType(policyActionType: PolicyActionType): boolean {
    return policyActionType === 'initialize'
  }

  async execute(requestPayload: PolicyRequestPayload): Promise<PolicyRequestResponse> {
    if (!requestPayload.ddo.credentialSubject)
      return buildInvalidRequestMessage(
        'Request body does not contain ddo.credentialSubject'
      )
    const url = `${process.env.WALTID_VERIFIER_URL}/openid4vc/verify`

    const requestCredentialsBody = parseRequestCredentials(requestPayload)
    const headers = {
      stateId: randomUUID()
    }
    const response = await axios.post(url, requestCredentialsBody, { headers })

    return {
      success: response.status === 200,
      message: response.data,
      httpStatus: response.status
    }
  }
}
