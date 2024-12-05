import { PolicyRequestResponse, PolicyRequestPayload } from './@types/policy'

export class PolicyHandler {
  // eslint-disable-next-line no-undef
  [key: string]: any

  async execute(
    policyRequestPayload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse> {
    const { action } = policyRequestPayload
    const authType = process.env.AUTH_TYPE || 'waltid'

    const method = this[action]
    if (typeof method === 'function') {
      return await method.call(this, policyRequestPayload)
    } else {
      throw new Error(`Action "${action}" does not exist in "${authType}" PolicyHandler`)
    }
  }
}
