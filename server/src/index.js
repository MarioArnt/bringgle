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

const env = process.env.NODE_ENV || 'development'
console.log(`Starting app in ${env} mode`)
console.log('Connecting database')
const dbConfig = config.database[env]
console.log(dbConfig)
mongoose.connect(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.name}`)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => {
  console.log('Connection Succeeded')
})

app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())
app.use('/', router)

server.listen(process.env.PORT || 8081)
console.log('Magic happens on port 8081')
SocketsUtils.initialize()

module.exports = app
