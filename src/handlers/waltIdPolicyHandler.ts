/* eslint-disable camelcase */
import axios from 'axios'
import { randomUUID } from 'crypto'
import { PolicyRequestPayload, PolicyRequestResponse } from '../@types/policy.js'
import { PolicyHandler } from '../policyHandler.js'
import {
  buildInvalidRequestMessage,
  buildVerificationErrorRequestMessage
} from '../utils/validateRequests.js'
import { logError, logInfo } from '../utils/logger.js'
export class WaltIdPolicyHandler extends PolicyHandler {
  public async initiate(
    requestPayload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse> {
    // if (!requestPayload.ddo.credentialSubject)
    //   return buildInvalidRequestMessage(
    //     'Request body does not contain ddo.credentialSubject'
    //   )

    const web3VerificationResult = this.verifyWeb3Address(requestPayload)

    if (!web3VerificationResult.success) {
      return buildVerificationErrorRequestMessage(
        web3VerificationResult.message || 'Web3 Address verification error',
        web3VerificationResult.code || 401
      )
    }

    const checkSSIPolicy = this.hasSSIPolicyToBeChecked(requestPayload)

    if (checkSSIPolicy.error) {
      return buildVerificationErrorRequestMessage(
        'SSIpolicy was found, but failed to fetch request credentials',
        401
      )
    }

    if (checkSSIPolicy.checkSSIPolicy) {
      const url = new URL(`/openid4vc/verify`, process.env.WALTID_VERIFIER_URL)

      const requestCredentialsBody = this.parseRequestCredentials(requestPayload)

      const uuid =
        requestPayload.sessionId && requestPayload.sessionId !== ''
          ? requestPayload.sessionId
          : randomUUID()

      const headers = {
        stateId: uuid,
        successRedirectUri: requestPayload.policyServer?.successRedirectUri
          ? requestPayload.policyServer.successRedirectUri
          : process.env.WALTID_SUCCESS_REDIRECT_URL || '',

        errorRedirectUri: requestPayload.policyServer?.errorRedirectUri
          ? requestPayload.policyServer.errorRedirectUri
          : process.env.WALTID_ERROR_REDIRECT_URL || ''
      }

      logInfo({
        message: 'WaltId: payload',
        url: url.toString(),
        headers,
        requestCredentialsBody
      })

      const response = await axios.post(url.toString(), requestCredentialsBody, {
        headers
      })

      logInfo({
        message: 'WaltId: response',
        url: url.toString(),
        response: response.data
      })

      const redirectUrl = requestPayload.policyServer?.responseRedirectUri
        ? requestPayload.policyServer?.responseRedirectUri.replace('$id', uuid)
        : process.env.WALTID_VERIFY_RESPONSE_REDIRECT_URL.replace('$id', uuid)
      const definitionUrl = requestPayload.policyServer?.responseRedirectUri
        ? requestPayload.policyServer?.presentationDefinitionUri.replace('$id', uuid)
        : process.env.WALTID_VERIFY_PRESENTATION_DEFINITION_URL.replace('$id', uuid)
      const updatedResponseData = response.data
        .replace(
          /response_uri=([^&]*)/,
          `response_uri=${encodeURIComponent(redirectUrl)}`
        )
        .replace(
          /presentation_definition_uri=([^&]*)/,
          `presentation_definition_uri=${encodeURIComponent(definitionUrl)}`
        )

      const policyResponse = {
        success: response.status === 200,
        message: updatedResponseData,
        httpStatus: response.status
      }

      logInfo({
        message: 'PS: response',
        policyResponse
      })

      return policyResponse
    } else {
      const policyResponse = {
        success: true,
        message: '',
        httpStatus: 200
      }

      logInfo({
        message: 'PS: response',
        policyResponse
      })

      return policyResponse
    }
  }

  public async presentationRequest(
    requestPayload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse> {
    if (!requestPayload.sessionId)
      return buildInvalidRequestMessage('Request body does not contain sessionId')

    const url = new URL(
      `/openid4vc/verify/${requestPayload.sessionId}`,
      process.env.WALTID_VERIFIER_URL
    )
    const requestBody = new URLSearchParams()
    if (requestPayload.vp_token) requestBody.append('vp_token', requestPayload.vp_token)
    if (requestPayload.presentation_submission)
      requestBody.append(
        'presentation_submission',
        requestPayload.presentation_submission
      )
    if (requestPayload.response) requestBody.append('response', requestPayload.response)

    logInfo({
      message: 'WaltId: payload',
      url: url.toString(),
      requestBody
    })

    try {
      const response = await axios.post(url.toString(), requestBody.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      logInfo({
        message: 'WaltId: response',
        url: url.toString(),
        response: response.data
      })

      // Cannot be verified anymore, because WALTID_SUCCESS_REDIRECT_URL could be passed in payload
      //
      // const success =
      //   !process.env.WALTID_SUCCESS_REDIRECT_URL ||
      //   (response.data.redirectUri &&
      //     this.verifySuccessRedirectUri(
      //       response.data.redirectUri,
      //       requestPayload.sessionId
      //     ))

      const responseData = {
        redirectUri: response.data,
        sessionId: requestPayload.sessionId
      }

      const policyResponse = {
        success: response.status === 200,
        message: responseData,
        httpStatus: response.status
      }
      logInfo({
        message: 'PS: response',
        policyResponse
      })

      return policyResponse
    } catch (error) {
      logError({
        message: 'WaltId: response',
        url: url.toString(),
        response: error?.response.data
      })

      const responseData = {
        redirectUri: error?.response.data,
        sessionId: requestPayload.sessionId
      }

      const policyResponse = {
        success: false,
        message: responseData,
        httpStatus: error?.response.status
      }
      logInfo({
        message: 'PS: response',
        policyResponse
      })

      return policyResponse
    }
  }

  public async getPD(
    requestPayload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse> {
    if (!requestPayload.sessionId)
      return buildInvalidRequestMessage('Request body does not contain sessionId')

    const url = new URL(
      `/openid4vc/pd/${requestPayload.sessionId}`,
      process.env.WALTID_VERIFIER_URL
    )

    logInfo({
      message: 'WaltId: payload',
      url: url.toString()
    })

    const response = await axios.get(url.toString())
    logInfo({
      message: 'WaltId: response',
      url: url.toString(),
      response: response.data
    })

    const policyResponse = {
      success: response.status === 200,
      message: response.data,
      httpStatus: response.status
    }
    logInfo({
      message: 'PS: response',
      policyResponse
    })

    return policyResponse
  }

  public async updateDDO(
    requestPayload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse> {
    const policyResponse = {
      success: true,
      message: '',
      httpStatus: 200
    }

    return await policyResponse
  }

  public async newDDO(
    requestPayload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse> {
    const policyResponse = {
      success: true,
      message: '',
      httpStatus: 200
    }

    return await policyResponse
  }

  public async encrypt(
    requestPayload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse> {
    const policyResponse = {
      success: true,
      message: '',
      httpStatus: 200
    }

    return await policyResponse
  }

  public async decrypt(
    requestPayload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse> {
    const policyResponse = {
      success: true,
      message: '',
      httpStatus: 200
    }

    return await policyResponse
  }

  verifySuccessRedirectUri(redirectUri: string, sessionId: string): boolean {
    const expectedUri = process.env.WALTID_SUCCESS_REDIRECT_URL.replace('$id', sessionId)
    logInfo({
      expectedUri,
      redirectUri
    })
    return decodeURIComponent(redirectUri) === expectedUri
  }

  public async checkSessionId(
    requestPayload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse> {
    if (!requestPayload.sessionId)
      return buildInvalidRequestMessage('Request body does not contain sessionId')

    const url = new URL(
      `/openid4vc/session/${requestPayload.sessionId}`,
      process.env.WALTID_VERIFIER_URL
    )

    logInfo({
      message: 'WaltId: payload',
      url
    })

    const response = await axios.get(url.toString())

    logInfo({
      message: 'WaltId: response',
      url: url.toString(),
      response: response.data
    })

    const policyResponse = {
      success: response.status === 200 && response.data.verificationResult === true,
      message: response.data,
      httpStatus: response.data.verificationResult === true ? response.status : 401
    }

    logInfo({
      message: 'PS: response',
      policyResponse
    })
    return policyResponse
  }

  public async download(
    requestPayload: PolicyRequestPayload
  ): Promise<PolicyRequestResponse> {
    if (typeof requestPayload.policyServer === 'string') {
      try {
        requestPayload.policyServer = JSON.parse(requestPayload.policyServer)
      } catch (error) {
        return buildInvalidRequestMessage('Failed to parse policyServer JSON string')
      }
    }

    const web3VerificationResult = this.verifyWeb3Address(requestPayload)

    if (!web3VerificationResult.success) {
      return buildVerificationErrorRequestMessage(
        web3VerificationResult.message || 'Web3 Address verification error',
        web3VerificationResult.code || 401
      )
    }

    const checkSSIPolicy = this.hasSSIPolicyToBeChecked(requestPayload)

    if (checkSSIPolicy.error) {
      return buildVerificationErrorRequestMessage(
        'SSIpolicy was found, but failed to fetch request credentials',
        401
      )
    }

    if (checkSSIPolicy.checkSSIPolicy) {
      if (!requestPayload.policyServer?.sessionId)
        return buildInvalidRequestMessage('Request body does not contain sessionId')

      const url = new URL(
        `/openid4vc/session/${requestPayload.policyServer.sessionId}`,
        process.env.WALTID_VERIFIER_URL
      )

      logInfo({
        message: 'WaltId: payload',
        url
      })

      const response = await axios.get(url.toString())

      logInfo({
        message: 'WaltId: response',
        url: url.toString(),
        response: response.data
      })

      const policyResponse = {
        success: response.status === 200 && response.data.verificationResult === true,
        message: response.data,
        httpStatus: response.data.verificationResult === true ? response.status : 401
      }
      logInfo({
        message: 'PS: response',
        policyResponse
      })
      return policyResponse
    } else {
      const policyResponse = {
        success: true,
        message: '',
        httpStatus: 200
      }

      logInfo({
        message: 'PS: response',
        policyResponse
      })

      return policyResponse
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
    logInfo({
      message: 'WaltId: payload',
      requestConfig
    })
    const response = await axios(requestConfig)

    logInfo({
      message: 'WaltId: response',
      url: url.toString(),
      response: response.data
    })

    const policyResponse = {
      success: response.status === 200,
      message: response.data,
      httpStatus: response.status
    }
    logInfo({
      message: 'PS: response',
      policyResponse
    })
    return policyResponse
  }

  private hasSSIPolicyToBeChecked(requestPayload: any): {
    checkSSIPolicy: boolean
    error?: boolean
  } {
    const credentialSubject = requestPayload?.ddo?.credentialSubject
    const serviceId = requestPayload?.serviceId
    if (!credentialSubject) return { checkSSIPolicy: false }

    const targetType = 'SSIpolicy'

    const assetPolicies =
      credentialSubject.credentials?.allow?.filter(
        (item: any) => item?.type === targetType
      ) ?? []

    const service = credentialSubject.services?.find((s: any) => s.id === serviceId)

    const servicePolicies =
      service?.credentials?.allow?.filter((item: any) => item?.type === targetType) ?? []

    const combinedPolicies = [...assetPolicies, ...servicePolicies]

    for (const policy of combinedPolicies) {
      if (!Array.isArray(policy.values)) continue

      for (const val of policy.values) {
        if (
          val?.request_credentials &&
          Array.isArray(val.request_credentials) &&
          val.request_credentials.length > 0
        ) {
          return { checkSSIPolicy: true }
        }
      }
    }

    return { checkSSIPolicy: false, error: combinedPolicies.length > 0 }
  }

  private parseRequestCredentials(requestPayload: any): any {
    const credentialSubject = requestPayload?.ddo?.credentialSubject
    const targetType = 'SSIpolicy'
    const credentialSubjectCredentials =
      credentialSubject?.credentials?.allow
        ?.filter((item: any) => item?.type === targetType)
        ?.flatMap((item: any) => item?.values ?? []) ?? []

    const serviceCredentials =
      credentialSubject?.services
        ?.filter((service: any) => service?.id === requestPayload.serviceId)
        ?.flatMap(
          (service: any) =>
            service?.credentials?.allow?.filter(
              (item: any) => item?.type === targetType
            ) ?? []
        )
        ?.flatMap((item: any) => item?.values ?? []) ?? []

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
    const vp_policies = new Set<string>()
    const vc_policies = new Set<string>()

    const envvp_policies = process.env.DEFAULT_VP_POLICIES
      ? JSON.parse(process.env.DEFAULT_VP_POLICIES)
      : []
    const envvc_policies = process.env.DEFAULT_VC_POLICIES
      ? JSON.parse(process.env.DEFAULT_VC_POLICIES)
      : []

    if (Array.isArray(envvp_policies))
      envvp_policies.forEach((policy: string) => vp_policies.add(policy))

    if (Array.isArray(envvc_policies))
      envvc_policies.forEach((policy: string) => vc_policies.add(policy))

    const request_credentialsMap = new Map<string, any>()

    combinedCredentials.forEach((entry: any) => {
      if (entry.vp_policies)
        entry.vp_policies.forEach((policy: string) => vp_policies.add(policy))
      if (entry.vc_policies)
        entry.vc_policies.forEach((policy: string) => vc_policies.add(policy))

      entry.request_credentials.forEach((credentialRequest: any) => {
        const uniqueKey = JSON.stringify({
          type: credentialRequest.type,
          format: credentialRequest.format,
          policies: credentialRequest.policies
        })

        if (!request_credentialsMap.has(uniqueKey)) {
          request_credentialsMap.set(uniqueKey, {
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
      vp_policies: Array.from(vp_policies),
      vc_policies: Array.from(vc_policies),
      request_credentials: Array.from(request_credentialsMap.values())
    }
  }

  private verifyWeb3Address(requestPayload: any): {
    success: boolean
    message?: string
    code?: number
  } {
    const consumerAddress = requestPayload.consumerAddress?.toLowerCase()
    const { ddo } = requestPayload
    const { serviceId } = requestPayload

    if (!consumerAddress || !ddo || !serviceId) {
      return {
        success: false,
        message: 'Missing required fields (consumerAddress, ddo, serviceId).',
        code: 400
      }
    }

    const assetCredentials = ddo.credentialSubject?.credentials || {}
    const assetAllowList = this.extractAddressList(assetCredentials.allow)
    const assetDenyList = this.extractAddressList(assetCredentials.deny)

    const service = ddo.credentialSubject?.services?.find((s: any) => s.id === serviceId)

    if (!service) {
      return { success: false, message: 'Service not found in DDO.', code: 400 }
    }

    const serviceAllowList = this.extractAddressList(service.credentials?.allow)
    const serviceDenyList = this.extractAddressList(service.credentials?.deny)

    const serviceDefinesAddressCredentials =
      this.hasAddressCredential(service.credentials?.allow) ||
      this.hasAddressCredential(service.credentials?.deny)

    if (
      assetDenyList.includes(consumerAddress) ||
      serviceDenyList.includes(consumerAddress)
    ) {
      return {
        success: false,
        message: 'Access denied: Address is in deny list.',
        code: 401
      }
    }

    if (
      this.hasAddressCredential(assetCredentials.allow) &&
      assetAllowList.length === 0
    ) {
      return {
        success: false,
        message: 'Access denied: Empty allow list at asset level.',
        code: 401
      }
    }

    if (
      this.hasAddressCredential(service.credentials?.allow) &&
      serviceAllowList.length === 0
    ) {
      return {
        success: false,
        message: 'Access denied: Empty allow list at service level.',
        code: 401
      }
    }

    const assetAllowsAll = assetAllowList.includes('*')
    const serviceAllowsAll = serviceAllowList.includes('*')

    if (!serviceDefinesAddressCredentials) {
      if (assetAllowsAll) {
        return { success: true }
      }

      return assetAllowList.includes(consumerAddress)
        ? { success: true }
        : {
            success: false,
            message: 'Access denied: Address not allowed at asset level.',
            code: 401
          }
    }

    if (assetAllowsAll && serviceAllowsAll) {
      return { success: true }
    }

    const assetMatch = assetAllowsAll || assetAllowList.includes(consumerAddress)
    const serviceMatch = serviceAllowsAll || serviceAllowList.includes(consumerAddress)

    if (assetMatch && serviceMatch) {
      return { success: true }
    }

    return {
      success: false,
      message: 'Access denied: Address not in both allow lists.',
      code: 401
    }
  }

  private extractAddressList(credentialsList: any[]): string[] {
    if (!Array.isArray(credentialsList)) return []

    const addressList: string[] = []

    for (const credential of credentialsList) {
      if (credential.type === 'address' && Array.isArray(credential.values)) {
        for (const value of credential.values) {
          if (typeof value === 'string') {
            addressList.push(value.toLowerCase())
          } else if (value?.address && typeof value.address === 'string') {
            addressList.push(value.address.toLowerCase())
          }
        }
      }
    }

    return addressList
  }

  private hasAddressCredential(credentialsList: any[]): boolean {
    if (!Array.isArray(credentialsList)) return false
    return credentialsList.some((c) => c.type === 'address')
  }
}
