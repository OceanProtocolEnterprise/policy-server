import winston from 'winston'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import DailyRotateFile from 'winston-daily-rotate-file'
import { Request, Response } from 'express'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const logsDir = path.join(__dirname, '../logs')

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    ({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`
  )
)

const transport = new DailyRotateFile({
  dirname: logsDir,
  filename: `%DATE%.log`,
  datePattern: 'DD-MM-YYYY',
  maxFiles: '30d',
  zippedArchive: false
})

const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [transport, new winston.transports.Console()]
})

export const logInfo = (message: string | object) =>
  logger.info(typeof message === 'object' ? JSON.stringify(message, null, 2) : message)
export const logWarn = (message: string | object) =>
  logger.warn(typeof message === 'object' ? JSON.stringify(message, null, 2) : message)
export const logError = (message: string | object) =>
  logger.error(typeof message === 'object' ? JSON.stringify(message, null, 2) : message)
export const logDebug = (message: string | object) =>
  logger.debug(typeof message === 'object' ? JSON.stringify(message, null, 2) : message)

export default logger

export function downloadLogs(req: Request, res: Response): void {
  try {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    const logsDir = path.join(__dirname, '../logs')

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }
    const { date } = req.query

    const today = new Date()
    const formattedToday = `${String(today.getDate()).padStart(2, '0')}-${String(
      today.getMonth() + 1
    ).padStart(2, '0')}-${today.getFullYear()}`

    const logDate = typeof date === 'string' ? date : formattedToday
    const logFilePath = path.join(logsDir, `${logDate}.log`)

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (!fs.existsSync(logFilePath)) {
      res.status(404).json({ success: false, message: 'Logs not found' })
    } else {
      res.download(logFilePath, `${logDate}.log`, (err) => {
        if (err) {
          res
            .status(500)
            .json({ success: false, message: 'Error while downloading logs' })
        }
      })
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
