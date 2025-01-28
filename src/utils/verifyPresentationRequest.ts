/* eslint-disable camelcase */
import { Request, Response } from 'express'
import axios from 'axios'

export async function handleVerifyPresentationRequest(
  req: Request<{ id: string }, {}, any>,
  res: Response
): Promise<void> {
  const { id } = req.params
  const vp_token = req.body?.vp_token || undefined
  const presentation_submission = req.body?.presentation_submission || undefined
  const response = req.body?.response || undefined

  const requestPayload = {
    action: 'presentationRequest',
    policyServer: {
      sessionId: id,
      vp_token,
      presentation_submission,
      response
    }
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`
  const apiResponse = await axios.post(`${baseUrl}/`, requestPayload, {
    headers: { 'Content-Type': 'application/json' }
  })

  res.status(apiResponse.status).json(apiResponse.data)
}
