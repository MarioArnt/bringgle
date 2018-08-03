const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const SocketsUtils = require('./sockets')(io)
const router = require('./api')(SocketsUtils)
const config = require('../config')
const logger = require('./logger')

const env = process.env.NODE_ENV || 'development'
logger.info(`Starting app in ${env} mode`)
logger.info('Connecting database')
const dbConfig = config.database[env]
logger.debug(dbConfig)
mongoose.connect(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`, { useNewUrlParser: true }).then(
  () => { logger.info('Database Connection Succeeded') },
  err => { logger.error('Database Connection Failed', err) }
)

app.use(morgan('combined', {
  skip: (req, res) => { return res.statusCode < 400 },
  stream: logger.stream
}))
app.use(bodyParser.json())
app.use(cors())
app.use('/', router)

server.listen(process.env.PORT || 8081)
logger.info('Magic happens on port 8081')
SocketsUtils.initialize()

module.exports = {
  app,
  SocketsUtils
}
