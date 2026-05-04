import express, { Request, Response } from 'express'
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
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { adminApiKeyAuth, policyServerApiKeyAuth } from './utils/auth.js'
import { startPolicyServer } from './serverStartup.js'
import {
  EnvConsumerAccessListStore,
  EnvNodeAccessListStore,
  PolicyRequestAuthenticator,
  RequestAuthenticator,
  initializeSharedAccessListStoresFromEnvironment
} from './utils/nodeRequestAuth.js'

dotenv.config()
const require = createRequire(import.meta.url)
const swaggerDoc = require('../swagger.json')

export function createApp(
  requestAuthenticator: RequestAuthenticator = PolicyRequestAuthenticator.fromEnvironment()
): express.Express {
  const app = express()
  const authType = process.env.AUTH_TYPE || 'waltid'
  const nodeAccessListStore = EnvNodeAccessListStore.fromEnvironment()
  const consumerAccessListStore = EnvConsumerAccessListStore.fromEnvironment()

  async function handlePolicyRequest(
    req: Request<{}, {}, PolicyRequestPayload>,
    res: Response
  ): Promise<void> {
    const { action, ...rest } = req.body
    const authFailure = await requestAuthenticator.authenticate(req.body)
    if (authFailure) {
      res.status(authFailure.httpStatus).json(authFailure)
      return
    }

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
    app.get('/listAcceptedNodes', adminApiKeyAuth, (_req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        httpStatus: 200,
        enabled: nodeAccessListStore.isEnabled(),
        addresses: nodeAccessListStore.getAddresses()
      })
    })

    app.post(
      '/reloadAcceptedNodes',
      adminApiKeyAuth,
      async (_req: Request, res: Response) => {
        try {
          await nodeAccessListStore.reloadFromEnvironment()
          res.status(200).json({
            success: true,
            httpStatus: 200,
            enabled: nodeAccessListStore.isEnabled(),
            addresses: nodeAccessListStore.getAddresses()
          })
        } catch (error) {
          res.status(500).json({
            success: false,
            httpStatus: 500,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to reload accepted node addresses.'
          })
        }
      }
    )

    app.get('/listAcceptedConsumers', adminApiKeyAuth, (_req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        httpStatus: 200,
        enabled: consumerAccessListStore.isEnabled(),
        addresses: consumerAccessListStore.getAddresses()
      })
    })

    app.post(
      '/reloadAcceptedConsumers',
      adminApiKeyAuth,
      async (_req: Request, res: Response) => {
        try {
          await consumerAccessListStore.reloadFromEnvironment()
          res.status(200).json({
            success: true,
            httpStatus: 200,
            enabled: consumerAccessListStore.isEnabled(),
            addresses: consumerAccessListStore.getAddresses()
          })
        } catch (error) {
          res.status(500).json({
            success: false,
            httpStatus: 500,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to reload accepted consumer addresses.'
          })
        }
      }
    )

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

await initializeSharedAccessListStoresFromEnvironment()
export const app = createApp()

const currentModulePath = fileURLToPath(import.meta.url)
const entrypointPath = process.argv[1] ? path.resolve(process.argv[1]) : ''

if (entrypointPath === currentModulePath) {
  startPolicyServer(app)
}
