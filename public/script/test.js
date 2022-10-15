window.addEventListener('load', event=>{
  const WS = new WebSocket('wss://localhost:3000/wii')


  WS.onmessage = msg=>{
    console.log('WII::MSG', msg)
  }


  WS.onclose = msg=>{
    console.log('WII::CLOSE', msg)
  }


  WS.onerror = msg=>{
    console.log('WII::ERR', msg)
  }


  document.getElementById('test-btn').addEventListener('click', event=>{
    WS.send('begin')
  })
})