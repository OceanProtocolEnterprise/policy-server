import fs from 'fs'
import https from 'https'
import type { Express } from 'express'
import type { Server } from 'http'

export interface TlsPaths {
  certPath?: string
  keyPath?: string
}

export function getServerPort(env: NodeJS.ProcessEnv = process.env): string {
  return env.PORT || '3000'
}

export function getTlsPaths(env: NodeJS.ProcessEnv = process.env): TlsPaths {
  return {
    certPath: env.HTTP_CERT_PATH,
    keyPath: env.HTTP_KEY_PATH
  }
}

function startHttpServer(app: Express, port: string): Server {
  return app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

export function startPolicyServer(app: Express): Server {
  const port = getServerPort()
  const { certPath, keyPath } = getTlsPaths()

  if (certPath && keyPath) {
    // TLS file paths are supplied by deployment configuration.
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const cert = fs.readFileSync(certPath)
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const key = fs.readFileSync(keyPath)
    return https.createServer({ cert, key }, app).listen(port, () => {
      console.log(`HTTPS server is running on port ${port}`)
    })
  }

  if (certPath || keyPath) {
    console.warn(
      'Both HTTP_CERT_PATH and HTTP_KEY_PATH must be configured to enable HTTPS. Starting HTTP server.'
    )
  }

  return startHttpServer(app, port)
}
