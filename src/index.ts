import express, { Request, Response } from 'express'
import swaggerDoc from '../swagger.json' assert { type: 'json' }
import swaggerUi from 'swagger-ui-express'
import { asyncHandler, requestLogger, errorHandler } from './utils/middleware.js'
import { PolicyRequestPayload, PolicyRequestResponse } from './@types/policy'
import { PolicyHandlerFactory } from './policyHandlerFactory.js'
import { handleVerifyPresentationRequest } from './utils/verifyPresentationRequest.js'
import { downloadLogs } from './utils/logger.js'

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
      status: 404,
      message: `Handler for auth type "${authType}" is not found.`
    })
  }

  const payload: PolicyRequestPayload = { action, ...rest }
  const response: PolicyRequestResponse = await handler.execute(payload)
  res.status(response.httpStatus).json(response)
}

app.use(express.json())
app.use(requestLogger)
app.post('/', asyncHandler(handlePolicyRequest))
if (process.env.OCEAN_NODE_URL) {
  app.post(
    '/verify/:id',
    express.urlencoded({ extended: true }),
    asyncHandler(handleVerifyPresentationRequest)
  )
}
if (process.env.ENABLE_LOGS && process.env.ENABLE_LOGS === '1') {
  app.get('/logs', downloadLogs)
}
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
app.use(errorHandler)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
