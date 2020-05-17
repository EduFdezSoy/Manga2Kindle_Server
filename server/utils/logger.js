/**
 * This module logs, that's all.
 *
 * @author Eduardo Fernandez
 */
const winston = require('winston')

const fileFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(info => `${info.timestamp} | ${info.level.padStart(7)} | ${info.message}`)
)

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(info => `\x1b[90m${info.timestamp}\x1b[0m | ${info.level.padStart(7)} | ${info.message}`)
)

/**
 * levels =
 *   error: 0
 *   warn: 1
 *   info: 2 --- max in file
 *   http: 3
 *   verbose: 4
 *   debug: 5
 *   silly: 6
 */
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: './logs/error.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      level: 'error',
      format: fileFormat
    }),
    new winston.transports.File({
      filename: './logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      format: fileFormat
    }),
    new winston.transports.File({
      filename: './logs/verbose.log',
      maxsize: 10485760, // 10MB
      maxFiles: 3,
      level: 'verbose',
      format: fileFormat
    }),
    new winston.transports.Console({
      level: 'silly',
      format: consoleFormat
    })
  ]
})

module.exports = logger
