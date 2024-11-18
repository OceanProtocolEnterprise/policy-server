import {
  AuthType,
  IPolicyHandler,
  PolicyActionType,
  PolicyRequestPayload,
  PolicyRequestResponse
} from '../@types/PolicyServer/policyServerTypes'
import { Request, Response } from 'express'
import { container } from '../handlers/container.js'
import { PolicyHandlerSelector } from '../handlers/policyHandlerSelector.js'
import { TYPES } from '../@types/PolicyServer/containerTypes.js'
import 'reflect-metadata'

const handlers = container.getAll<IPolicyHandler>(TYPES.IPolicyHandler)
const handlerSelector = new PolicyHandlerSelector(handlers)

const authType = process.env.AUTH_TYPE || 'waltid'
export async function handlePolicyRequest(
  req: Request<{}, {}, PolicyRequestPayload>,
  res: Response
): Promise<void> {
  console.log('Request body:', req.body)
  const { action, ...rest } = req.body

  const handler = handlerSelector.selectHandler(
    authType as AuthType,
    action as PolicyActionType
  )

  if (!handler) {
    const errorResponse: PolicyRequestResponse = {
      success: false,
      message: `No handler found for authType: "${authType}" and actionType: "${action}"`,
      httpStatus: 400
    }
    res.status(errorResponse.httpStatus).json(errorResponse)
    return
  }

  const payload: PolicyRequestPayload = { action, ...rest }
  const response: PolicyRequestResponse = await handler.execute(payload)
  res.status(response.httpStatus).json(response)
}
