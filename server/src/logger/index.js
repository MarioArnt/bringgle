const { createLogger, format, transports } = require('winston')
const moment = require('moment')
const { combine, timestamp, printf } = format

const myFormat = printf(info => {
  return `[${info.level} @ ${moment(info.timestamp).format('DD/MM/YY hh:mm:ss.SSS')}]: ${info.message}`
})

const useTransports = []

if (process.env.NODE_ENV === 'production') {
  useTransports.push(new transports.File({
    filename: 'error.log',
    level: 'error',
    format: format.json()
  }))
  useTransports.push(new transports.File({
    filename: 'combined.log',
    level: 'info',
    format: format.json()
  }))
} else if (process.env.NODE_ENV === 'test') {
  useTransports.push(new transports.Console({
    format: combine(
      format.colorize(),
      timestamp(),
      myFormat
    ),
    level: 'error'
  }))
} else {
  useTransports.push(new transports.Console({
    format: combine(
      format.colorize(),
      timestamp(),
      myFormat
    ),
    level: 'silly'
  }))
}

const logger = createLogger({
  transports: useTransports
})

module.exports = logger
