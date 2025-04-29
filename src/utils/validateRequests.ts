import { PolicyRequestResponse } from '../@types/policy'
import { logError } from './logger.js'

export function buildInvalidRequestMessage(cause: string): PolicyRequestResponse {
  const response = {
    success: false,
    httpStatus: 400,
    message: cause
  }
  logError(response)
  return response
}

export function buildNotImplementedRequestMessage(): PolicyRequestResponse {
  const response = {
    success: false,
    httpStatus: 501,
    message: 'Not implemented exception'
  }
  logError(response)
  return response
}

export function buildVerificationErrorRequestMessage(
  cause: string,
  code: number,
  redirectUri?: string
): PolicyRequestResponse {
  const response = {
    success: false,
    httpStatus: code,
    message: {
      redirectUri,
      error: cause
    }
  }
  logError(response)
  return response
}
