import express from 'express'
import swaggerDoc from '../swagger.json' assert { type: 'json' }
import swaggerUi from 'swagger-ui-express'
import dotenv from 'dotenv'
import { handlePolicyRequest } from './services/policyRouterService.js'
import errorHandler, { asyncHandler } from './utils/middleware.js'
const app = express()
dotenv.config()

app.use(express.json())
app.post('/', asyncHandler(handlePolicyRequest))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
app.use(errorHandler)
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
