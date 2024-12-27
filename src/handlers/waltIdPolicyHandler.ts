import axios from 'axios'
import { randomUUID } from 'crypto'
import { PolicyRequestPayload, PolicyRequestResponse } from '../@types/policy.js'
import { PolicyHandler } from '../policyHandler.js'
import { buildInvalidRequestMessage } from '../utils/validateRequests.js'
export class WaltIdPolicyHandler extends PolicyHandler {
  public async initialize(
    requestPayload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse> {
    if (!requestPayload.ddo.credentialSubject)
      return buildInvalidRequestMessage(
        'Request body does not contain ddo.credentialSubject'
      )
    const url = `${process.env.WALTID_VERIFIER_URL}/openid4vc/verify`

    const requestCredentialsBody = this.parseRequestCredentials(requestPayload)
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

  public async download(
    requestPayload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse> {
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

  public async passthrough(
    requestPayload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse> {
    if (!requestPayload.url)
      return buildInvalidRequestMessage('Request body does not contain url')
    else if (!requestPayload.httpMethod) {
      return buildInvalidRequestMessage('Request body does not contain httpMethod')
    }
    const payloadUrl = requestPayload.url.trimStart('/')
    const url = `${process.env.WALTID_VERIFIER_URL}/${payloadUrl}`
    const requestConfig = {
      method: requestPayload.httpMethod.toLowerCase(),
      url,
      data: requestPayload.body
    }
    const response = await axios(requestConfig)
    return {
      success: response.status === 200,
      message: response.data,
      httpStatus: response.status
    }
  }

  private parseRequestCredentials(requestPayload: any): any {
    const credentialSubject = requestPayload?.ddo?.credentialSubject

    const credentialSubjectCredentials =
      credentialSubject?.credentials?.flatMap((entry: any) => entry.allow || []) || []

    const serviceCredentials =
      credentialSubject?.services?.flatMap((service: any) =>
        service.credentials?.flatMap((entry: any) => entry.allow || [])
      ) || []

    if (credentialSubjectCredentials.length === 0 && serviceCredentials.length === 0) {
      console.warn("No 'credentials' found in credentialSubject or its services.")
      return {
        vp_policies: [],
        vc_policies: [],
        request_credentials: []
      }
    }

    const combinedCredentials = [
      ...new Set([...credentialSubjectCredentials, ...serviceCredentials])
    ]
    const vpPolicies = new Set<string>()
    const vcPolicies = new Set<string>()

    const envVpPolicies = process.env.DEFAULT_VP_POLICIES
      ? JSON.parse(process.env.DEFAULT_VP_POLICIES)
      : []
    const envVcPolicies = process.env.DEFAULT_VC_POLICIES
      ? JSON.parse(process.env.DEFAULT_VC_POLICIES)
      : []

    if (Array.isArray(envVpPolicies))
      envVpPolicies.forEach((policy: string) => vpPolicies.add(policy))

    if (Array.isArray(envVcPolicies))
      envVcPolicies.forEach((policy: string) => vcPolicies.add(policy))

    const requestCredentialsMap = new Map<string, any>()

    combinedCredentials.forEach((entry: any) => {
      if (entry.vpPolicies)
        entry.vpPolicies.forEach((policy: string) => vpPolicies.add(policy))
      if (entry.vcPolicies)
        entry.vcPolicies.forEach((policy: string) => vcPolicies.add(policy))

      entry.requestCredentials.forEach((credentialRequest: any) => {
        const uniqueKey = JSON.stringify({
          type: credentialRequest.type,
          format: credentialRequest.format,
          policies: credentialRequest.policies
        })

        if (!requestCredentialsMap.has(uniqueKey)) {
          requestCredentialsMap.set(uniqueKey, {
            type: credentialRequest.type,
            format: credentialRequest.format,
            policies: credentialRequest.policies
              ?.map((policy: any) => {
                if (typeof policy === 'string') {
                  return policy
                }
                if (typeof policy === 'object' && policy.policy) {
                  return {
                    policy: policy.policy,
                    args: policy.args
                  }
                }
                return undefined
              })
              .filter(Boolean)
          })
        }
      })
    })

    return {
      vp_policies: Array.from(vpPolicies),
      vc_policies: Array.from(vcPolicies),
      request_credentials: Array.from(requestCredentialsMap.values())
    }
  }
}
