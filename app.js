const cookieParser = require('cookie-parser')
const cors = require('cors')
const express = require('express')
const expressWS = require('express-ws')
const fs = require('fs')
const https = require('https')
const logger = require('morgan')
const path = require('path')
const Wii = require('./WiiNode')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')

const app = express();

const app_root = path.resolve(__dirname)
console.log('application root', app_root)

// setup SSL for HTTPS & WSS
const key = fs.readFileSync(`${app_root}/local.key`)
const cert = fs.readFileSync(`${app_root}/local.crt`)
const server = https.createServer(
  {
    key:key,
    cert:cert
  },
  app,
)

require('express-ws')(app, server)


app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)


app.ws('/wii', async(ws,req)=>{
  ws.on('message', msg=>{
    try {
      if (Wii) {
        ws.send(Wii)
      } else {
        ws.send('nil')
      }
    } catch (error) {
      ws.send(`-7`)
    }
  })


  const WSTimer = setInterval(() => {
    try {
      if (Wii) {
        ws.send(Wii)
      }
    } catch (error) {
      ws.send(`-7`)
    }
  }, 100)
})


module.exports = {
  app: app,
  server: server,
}