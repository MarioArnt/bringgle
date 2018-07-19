import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import router from './api'

const app = express()

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

app.listen(process.env.PORT || 8081)
console.log('Magic happens on port 8081')
