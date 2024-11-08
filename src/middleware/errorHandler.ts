import { Request, Response, NextFunction } from 'express'
import { PolicyRequestResponse } from '../@types/request'

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err)

  const response: PolicyRequestResponse = {
    success: false,
    message: err.message || 'An error occurred',
    httpStatus: 500
  }

  res.status(response.httpStatus).json(response)
}

export default errorHandler
