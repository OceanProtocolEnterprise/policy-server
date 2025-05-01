import { PolicyRequestResponse } from '../@types/policy'
import { logError } from './logger.js'

export function buildInvalidRequestMessage(cause: string): PolicyRequestResponse {
  const response = {
    success: false,
    httpStatus: ERROR_CODES.MISSING_FIELDS,
    message: cause
  }
  logError(response)
  return response
}

export function buildNotImplementedRequestMessage(): PolicyRequestResponse {
  const response = {
    success: false,
    httpStatus: ERROR_CODES.NOT_IMPLEMENTED,
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

export const ERROR_CODES = {
  MISSING_FIELDS: 400,
  INVALID_JSON: 422,
  SERVICE_NOT_FOUND: 404,
  ADDRESS_DENIED: 403,
  ADDRESS_NOT_ALLOWED: 403,
  EMPTY_ALLOW_LIST: 403,
  SESSION_REQUIRED: 400,
  CREDENTIAL_FETCH_FAILED: 422,
  UNKNOWN_ERROR: 500,
  NOT_IMPLEMENTED: 500
}
