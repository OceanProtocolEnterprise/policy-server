import { timingSafeEqual } from 'crypto'
import { Request, Response, NextFunction, RequestHandler } from 'express'
import { logWarn } from './logger.js'

const API_KEY_HEADER = 'x-api-key'
const REDACTED_VALUE = '[REDACTED]'
const SENSITIVE_HEADERS = new Set(['x-api-key', 'authorization', 'cookie', 'set-cookie'])

export function redactSensitiveHeaders(
  headers: Request['headers']
): Record<string, string | string[] | undefined> {
  return Object.entries(headers).reduce<Record<string, string | string[] | undefined>>(
    (sanitizedHeaders, [key, value]) => {
      sanitizedHeaders[key] = SENSITIVE_HEADERS.has(key.toLowerCase())
        ? REDACTED_VALUE
        : value
      return sanitizedHeaders
    },
    {}
  )
}

function isApiKeyValid(providedApiKey: string, expectedApiKey: string): boolean {
  const providedBuffer = Buffer.from(providedApiKey)
  const expectedBuffer = Buffer.from(expectedApiKey)

  if (providedBuffer.length !== expectedBuffer.length) return false

  return timingSafeEqual(providedBuffer, expectedBuffer)
}

export const policyServerApiKeyAuth: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const expectedApiKey = process.env.POLICY_SERVER_API_KEY?.trim()

  if (!expectedApiKey) {
    next()
    return
  }

  const providedApiKey = req.get(API_KEY_HEADER)
  if (!providedApiKey || !isApiKeyValid(providedApiKey, expectedApiKey)) {
    logWarn({
      method: req.method,
      url: req.originalUrl,
      headers: redactSensitiveHeaders(req.headers),
      message: 'Policy Server API key authentication failed.'
    })
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
      httpStatus: 401
    })
    return
  }

  next()
}
