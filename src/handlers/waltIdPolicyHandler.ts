import axios from 'axios'
import { randomUUID } from 'crypto'
import { PolicyRequestPayload, PolicyRequestResponse } from '../@types/policy.js'
import { PolicyHandler } from '../policyHandler.js'
import { buildInvalidRequestMessage } from '../utils/validateRequests.js'
export class WaltIdPolicyHandler extends PolicyHandler {
  public async initiate(
    requestPayload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse> {
    if (!requestPayload.ddo.credentialSubject)
      return buildInvalidRequestMessage(
        'Request body does not contain ddo.credentialSubject'
      )

    const url = new URL(`/openid4vc/verify`, process.env.WALTID_VERIFIER_URL)

    const requestCredentialsBody = this.parseRequestCredentials(requestPayload)
    const uuid = randomUUID()

    const headers = {
      stateId: uuid,
      successRedirectUri: process.env.WALTID_SUCCESS_REDIRECT_URL || ''
    }

    const response = await axios.post(url.toString(), requestCredentialsBody, { headers })

    const redirectUrl = process.env.WALTID_VERIFY_RESPONSE_REDIRECT_URL.replace(
      '$id',
      uuid
    )
    const updatedResponseData = response.data.replace(
      /response_uri=([^&]*)/,
      `response_uri=${encodeURIComponent(redirectUrl)}`
    )

    return {
      success: response.status === 200,
      message: updatedResponseData,
      httpStatus: response.status
    }
  }

  public async presentationRequest(
    requestPayload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse> {
    if (!requestPayload.policyServer.sessionId)
      return buildInvalidRequestMessage(
        'Request body does not contain policyServer.sessionId'
      )

    if (!requestPayload.policyServer.vp_token)
      return buildInvalidRequestMessage(
        'Request body does not contain policyServer.vp_token'
      )

    if (!requestPayload.policyServer.response)
      return buildInvalidRequestMessage(
        'Request body does not contain policyServer.response'
      )

    if (!requestPayload.policyServer.presentation_submission)
      return buildInvalidRequestMessage(
        'Request body does not contain policyServer.presentation_submission'
      )

    const url = new URL(
      `/openid4vc/verify/${requestPayload.policyServer.sessionId}`,
      process.env.WALTID_VERIFIER_URL
    )

    const requestBody = {
      vp_token: requestPayload.policyServer.vp_token,
      response: requestPayload.policyServer.response,
      presentation_submission: requestPayload.policyServer.presentation_submission
    }

    const response = await axios.post(url.toString(), requestBody)
    const success =
      !process.env.WALTID_SUCCESS_REDIRECT_URL ||
      (response.data.redirect_uri &&
        this.verifySuccessRedirectUri(
          response.data.redirect_uri,
          requestPayload.policyServer.sessionId
        ))
    return {
      success: response.status === 200 && success,
      message: response.data,
      httpStatus: response.status
    }
  }

  verifySuccessRedirectUri(redirectUri: string, sessionId: string): boolean {
    const expectedUri = process.env.WALTID_SUCCESS_REDIRECT_URL.replace('$id', sessionId)
    return decodeURIComponent(redirectUri) === expectedUri
  }

  public async checkSessionId(
    requestPayload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse> {
    if (!requestPayload.policyServer.sessionId)
      return buildInvalidRequestMessage(
        'Request body does not contain policyServer.sessionId'
      )

    const url = new URL(
      `/openid4vc/session/${requestPayload.policyServer.sessionId}`,
      process.env.WALTID_VERIFIER_URL
    )

    const response = await axios.get(url.toString())
    return {
      success: response.status === 200 && response.data.verificationResult,
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

    const url = new URL(
      `/openid4vc/session/${requestPayload.policyServer.sessionId}`,
      process.env.WALTID_VERIFIER_URL
    )

    const response = await axios.get(url.toString())
    return {
      success: response.status === 200 && response.data.verificationResult,
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

    const url = new URL(`/${payloadUrl}`, process.env.WALTID_VERIFIER_URL).toString()
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
