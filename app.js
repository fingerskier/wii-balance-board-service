const cookieParser = require('cookie-parser')
const cors = require('cors')
const debug = require('debug')('wii-bbs:app')
const express = require('express')
const expressWS = require('express-ws')
const fs = require('fs')
const https = require('https')
const logger = require('morgan')
const path = require('path')
const BalanceBoard = require('./WiiBalanceBoard')

debug('Wii init')


const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')

const app = express();

const app_root = path.resolve(__dirname)
debug('application root', app_root)


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

let wiiData, prev_wiiData
  
Wii.on("data", data => {
  wiiData = data
  // ws.send(wiiData)
  //debug('wiidata', wiiData)
})


app.ws('/wii', async(ws,req)=>{
  let wiiData
  
  BalanceBoard.connect()
  
  debug('Wii CONX')
  
  setInterval(()=>{
    if ((ws.readyState === 1) && (wiiData !== prev_wiiData)) {
      ws.send(JSON.stringify(wiiData))
    }
  }, 234)
  
  
  ws.on('message', msg=>{
    try {
      debug('msg', msg, 'data~', wiiData)
      
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


debug('server setup complete')


module.exports = {
  app: app,
  server: server,
}
