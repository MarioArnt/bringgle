const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const SocketsUtils = require('./sockets')(io)
const router = require('./api')

mongoose.connect('mongodb://localhost:27017/bringgle')
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
