const cookieParser = require('cookie-parser')
const cors = require('cors')
const express = require('express')
const expressWS = require('express-ws')
const fs = require('fs')
const https = require('https')
const logger = require('morgan')
const path = require('path')
const BalanceBoard = require('./WiiBalanceBoard')

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
// app.use(express.urlencoded({ extended: false }))
// app.use(cookieParser())
app.use(cors())


app.use('/', express.static(path.join(__dirname, 'public')))

app.ws('/wii', async(ws,req)=>{
  let wiiData

  BalanceBoard.connect()
  
  console.log('WII:CONX')
  
  ws.on('message', msg=>{
    try {
      console.log('WIIDATA1', wiiData)
      
      ws.send(JSON.stringify(wiiData))
    } catch (error) {
      console.error(error)
      ws.send(`-7`)
    }
  })

  
  BalanceBoard.on("data", data => {
    wiiData = data
    ws.send(wiiData)
    console.log('WIIDATA2', wiiData)
  })
})


module.exports = {
  app: app,
  server: server,
}