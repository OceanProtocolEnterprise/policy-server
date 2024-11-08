import express from 'express'
import { router } from './routes/policyRouter.js'
import swaggerDoc from './docs/swagger.json' assert { type: 'json' }
import swaggerUi from 'swagger-ui-express'
import errorHandler from './middleware/errorHandler.js'
const app = express()

app.use(express.json())
app.use('/', router)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
app.use(errorHandler)
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
