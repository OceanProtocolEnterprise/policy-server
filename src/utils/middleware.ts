import { Request, Response, NextFunction, RequestHandler } from 'express'
import axios, { AxiosError } from 'axios'
import { PolicyRequestResponse } from '../@types/policy'

export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }

const errorHandler = (
  err: Error | AxiosError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err)

  let response: PolicyRequestResponse

  if (axios.isAxiosError(err) && err.response) {
    response = {
      success: false,
      message: err.response.data?.message || 'An unexpected error occurred',
      httpStatus: err.response.status
    }
  } else {
    response = {
      success: false,
      message: err.message || 'An unexpected error occurred',
      httpStatus: 500
    }
  }

  res.status(response.httpStatus).json(response)
}

export default errorHandler
