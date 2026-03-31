import express, { Request, Response } from 'express'
import swaggerDoc from '../swagger.json' assert { type: 'json' }
import swaggerUi from 'swagger-ui-express'
import { asyncHandler, requestLogger, errorHandler } from './utils/middleware.js'
import { PolicyRequestPayload, PolicyRequestResponse } from './@types/policy'
import { PolicyHandlerFactory } from './policyHandlerFactory.js'
import {
  handleGetPD,
  handleVerifyPresentationRequest
} from './utils/verifyPresentationRequest.js'
import { downloadLogs } from './utils/logger.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { policyServerApiKeyAuth } from './utils/auth.js'

dotenv.config()

export function createApp(): express.Express {
  const app = express()
  const authType = process.env.AUTH_TYPE || 'waltid'

  async function handlePolicyRequest(
    req: Request<{}, {}, PolicyRequestPayload>,
    res: Response
  ): Promise<void> {
    const { action, ...rest } = req.body

    const handler = PolicyHandlerFactory.createPolicyHandler(authType)
    if (handler == null) {
      res.status(404).json({
        success: false,
        httpStatus: 404,
        message: `Handler for auth type "${authType}" is not found.`
      })
      return
    }

    const payload: PolicyRequestPayload = { action, ...rest }
    const response: PolicyRequestResponse = await handler.execute(payload)
    res.status(response.httpStatus).json(response)
  }

  app.use(express.json())

  if (process.env.MODE_PS === '1') {
    app.post(
      '/',
      policyServerApiKeyAuth,
      requestLogger,
      asyncHandler(handlePolicyRequest)
    )
  }
  if (process.env.OCEAN_NODE_URL && process.env.MODE_PROXY === '1') {
    app.post(
      '/verify/:id',
      express.urlencoded({ extended: true }),
      requestLogger,
      asyncHandler(handleVerifyPresentationRequest)
    )
    app.get('/pd/:id', requestLogger, asyncHandler(handleGetPD))
  }
  if (process.env.ENABLE_LOGS === '1') {
    app.get('/logs', requestLogger, downloadLogs)
  }
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
  app.use(errorHandler)

  return app
}

export const app = createApp()

const currentModulePath = fileURLToPath(import.meta.url)
const entrypointPath = process.argv[1] ? path.resolve(process.argv[1]) : ''

if (entrypointPath === currentModulePath) {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}
