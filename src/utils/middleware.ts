import { Request, Response, NextFunction, RequestHandler } from 'express'
import axios, { AxiosError } from 'axios'
import { PolicyRequestResponse } from '../@types/policy'
import { logError, logInfo } from './logger.js'

export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const logMessage = {
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: req.body
  }

  logInfo(logMessage)
  next()
}

export const errorHandler = (
  err: Error | AxiosError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err)

  let response: PolicyRequestResponse
  const logMessage = {
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    body: req.body,
    error: {
      message: err.message,
      stack: err.stack
    }
  } as any

  if (axios.isAxiosError(err) && err.response) {
    response = {
      success: false,
      message: err.response.data?.message || 'An unexpected error occurred',
      httpStatus: err.response.status
    }

    logMessage.error = {
      ...logMessage.error,
      axiosResponse: {
        status: err.response.status,
        data: err.response.data
      }
    }
  } else {
    response = {
      success: false,
      message: err.message || 'An unexpected error occurred',
      httpStatus: 500
    }
  }

  logError(logMessage)
  res.status(response.httpStatus).json(response)
}
