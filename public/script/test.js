let container, WS


function connect() {
  WS = new WebSocket('wss://localhost:3030/wii')


  WS.onmessage = msg=>{
    const dat = JSON.parse(msg.data)
    console.log('WII::MSG', dat)

    render(dat)
  }


  WS.onclose = msg=>{
    console.log('WII::CLOSE', msg)
  }


  WS.onerror = msg=>{
    console.log('WII::ERR', msg)
  }
}


function render(data) {
  let markup = ''

  for (let key in data) {
    markup += `<li>${key}: ${data[key]}</li>`
  }

  container.innerHTML = markup
}


window.addEventListener('load', event=>{
  container = document.getElementById('data')


  document.getElementById('conx-btn').addEventListener('click', event=>{
    connect()
  })


  document.getElementById('ping-btn').addEventListener('click', event=>{
    WS.send('begin')
  })
})