import { PolicyRequestResponse } from '../@types/policy'

export function buildInvalidRequestMessage(cause: string): PolicyRequestResponse {
  return {
    success: false,
    httpStatus: 400,
    message: cause
  }
}

export function buildNotImplementedRequestMessage(): PolicyRequestResponse {
  return {
    success: false,
    httpStatus: 501,
    message: 'Not implemented exception'
  }
}
