import { Request, Response } from 'express'
import { PolicyHandlerFactory } from '../policyHandlerFactory.js'
import { PolicyRequestPayload, PolicyRequestResponse } from '../@types/policy'

const authType = process.env.AUTH_TYPE || 'waltid'
export async function handlePolicyRequest(
  req: Request<{}, {}, PolicyRequestPayload>,
  res: Response
): Promise<void> {
  console.log('Request body:', req.body)
  const { action, ...rest } = req.body

  const handler = PolicyHandlerFactory.createPolicyHandler(authType)
  if (handler == null) {
    res.status(404).json({
      success: false,
      status: 404,
      message: `Handler for auth type "${authType}" is not found.`
    })
  }

  const payload: PolicyRequestPayload = { action, ...rest }
  const response: PolicyRequestResponse = await handler.execute(payload)
  res.status(response.httpStatus).json(response)
}
