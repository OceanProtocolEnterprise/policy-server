/* eslint-disable camelcase */
import { Request, Response } from 'express'
import axios from 'axios'
import { logError, logInfo } from './logger.js'
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
  try {
    const apiResponse = await axios.post(baseUrl.toString(), requestPayload, {
      headers: { 'Content-Type': 'application/json' }
    })

    logInfo({
      message: 'Ocean node: response',
      baseUrl: baseUrl.toString(),
      status: apiResponse.status,
      data: apiResponse.data
    })
    const statusCode = apiResponse?.status

    logInfo({
      message: 'Proxy: response',
      status: statusCode,
      data: { redirectUri: apiResponse?.data?.message?.redirectUri }
    })
    res
      .status(statusCode)
      .contentType('text/plain')
      .send(apiResponse?.data?.message?.redirectUri)
  } catch (error) {
    logError({
      message: 'Proxy: response error',
      status: error?.response?.status,
      data: { error: error?.response?.data?.message }
    })
    logInfo({
      message: 'Proxy: response',
      status: error?.response?.status,
      data: { redirectUri: error?.response?.data?.message?.redirectUri || '' }
    })
    res
      .status(error?.response?.status)
      .contentType('text/plain')
      .send(error?.response?.data?.message?.redirectUri || '')
  }
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
