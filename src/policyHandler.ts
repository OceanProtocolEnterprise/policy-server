import { PolicyRequestResponse, PolicyRequestPayload } from './@types/policy'
import { logError } from './utils/logger.js'

export class PolicyHandler {
  // eslint-disable-next-line no-undef
  [key: string]: any

  public getOpaServerUrl(): PolicyRequestResponse {
    return {
      success: true,
      message: process.env.OPA_SERVER ?? null,
      httpStatus: 200
    }
  }

  async execute(
    policyRequestPayload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse> {
    const { action } = policyRequestPayload
    const authType = process.env.AUTH_TYPE || 'waltid'

    const method = this[action]
    if (typeof method === 'function') return await method.call(this, policyRequestPayload)
    else {
      const msg = `Action "${action}" does not exist in "${authType}" PolicyHandler`
      logError(msg)
      return {
        success: false,
        message: msg,
        httpStatus: 404
      }
    }
  }
}
