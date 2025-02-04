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
      policyServer: {
        sessionId: id,
        vp_token,
        presentation_submission,
        response
      }
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

  res.status(apiResponse.status).json(apiResponse.data)
}
