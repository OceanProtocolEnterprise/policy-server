import fs from 'fs'
import https from 'https'
import type { Express } from 'express'
import type { Server } from 'http'

export interface TlsPaths {
  certPath?: string
  keyPath?: string
}

interface TlsOptions {
  cert: Buffer
  key: Buffer
}

export function getServerPort(env: NodeJS.ProcessEnv = process.env): string {
  return env.PORT || '3000'
}

function normalizePath(value?: string): string | undefined {
  const trimmed = value?.trim()
  return trimmed || undefined
}

export function getTlsPaths(env: NodeJS.ProcessEnv = process.env): TlsPaths {
  return {
    certPath: normalizePath(env.HTTP_CERT_PATH),
    keyPath: normalizePath(env.HTTP_KEY_PATH)
  }
}

export function getTlsOptions({ certPath, keyPath }: TlsPaths): TlsOptions | null {
  if (!certPath || !keyPath) {
    return null
  }

  try {
    // TLS file paths are supplied by deployment configuration.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const cert = fs.readFileSync(certPath)
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const key = fs.readFileSync(keyPath)
    return { cert, key }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.warn(
      `Unable to load HTTPS certificate files: ${message}. Starting HTTP server.`
    )
    return null
  }
}

function startHttpServer(app: Express, port: string): Server {
  return app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

export function startPolicyServer(app: Express): Server {
  const port = getServerPort()
  const tlsPaths = getTlsPaths()
  const { certPath, keyPath } = tlsPaths

  if (certPath && keyPath) {
    const tlsOptions = getTlsOptions(tlsPaths)
    if (tlsOptions) {
      return https.createServer(tlsOptions, app).listen(port, () => {
        console.log(`HTTPS server is running on port ${port}`)
      })
    }
  }

  if (!certPath !== !keyPath) {
    console.warn(
      'Both HTTP_CERT_PATH and HTTP_KEY_PATH must be configured to enable HTTPS. Starting HTTP server.'
    )
  }

  return startHttpServer(app, port)
}
