/* eslint-disable camelcase */
import { Request, Response } from 'express'
import axios from 'axios'
import { logInfo } from './logger.js'

export async function handleVerifyPresentationRequest(
  req: Request<{ id: string }, {}, any>,
  res: Response
): Promise<void> {
  const { id } = req.params
  const vp_token = req.body?.vp_token || undefined
  const presentation_submission = req.body?.presentation_submission || undefined
  const response = req.body?.response || undefined

  const requestPayload = {
    policyServerPassthrough: {
      action: 'presentationRequest',
      sessionId: id,
      vp_token,
      presentation_submission,
      response
    }
  }

  const baseUrl = new URL(
    '/api/services/PolicyServerPassThrough',
    process.env.OCEAN_NODE_URL
  )

  logInfo({
    message: 'Ocean node: payload',
    baseUrl: baseUrl.toString(),
    requestPayload
  })

  const apiResponse = await axios.post(baseUrl.toString(), requestPayload, {
    headers: { 'Content-Type': 'application/json' }
  })

  logInfo({
    message: 'Ocean node: response',
    baseUrl: baseUrl.toString(),
    status: apiResponse.status,
    data: apiResponse.data
  })
  const statusCode =
    apiResponse?.data?.success === false ? 500 : apiResponse?.status || 200

  const responseData = apiResponse?.data?.success
    ? {
        redirectUri: apiResponse?.data?.message?.successRedirectUri || ''
      }
    : {
        redirectUri: apiResponse?.data?.message?.errorRedirectUri || '',
        errorMessage: apiResponse.data.errorMessage || 'Unknown error'
      }

  logInfo({
    message: 'Proxy: response',
    status: statusCode,
    data: responseData
  })

  res.status(statusCode).json(responseData)
}

export async function handleGetPD(
  req: Request<{ id: string }, {}, any>,
  res: Response
): Promise<void> {
  const { id } = req.params

  const requestPayload = {
    policyServerPassthrough: {
      action: 'getPD',
      sessionId: id
    }
  }

  const baseUrl = new URL(
    '/api/services/PolicyServerPassThrough',
    process.env.OCEAN_NODE_URL
  )

  logInfo({
    message: 'Ocean node: payload',
    baseUrl: baseUrl.toString(),
    requestPayload
  })

  const apiResponse = await axios.post(baseUrl.toString(), requestPayload, {
    headers: { 'Content-Type': 'application/json' }
  })

  logInfo({
    message: 'Ocean node: response',
    baseUrl: baseUrl.toString(),
    status: apiResponse.status,
    data: apiResponse.data
  })
  const statusCode =
    apiResponse?.data?.success === false ? 500 : apiResponse?.status || 200

  logInfo({
    message: 'Proxy: response',
    status: statusCode,
    data: apiResponse?.data?.message || 'Unknown error'
  })
  res.status(statusCode).json(apiResponse?.data?.message || 'Unknown error')
}
