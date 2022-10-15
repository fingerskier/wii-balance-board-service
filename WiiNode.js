const BalanceBoard = require("wii-balance-board-pi")

const balanceBoard = new BalanceBoard()

let Wii


balanceBoard.connect()

balanceBoard.on("data", data => {
  console.log(data)

  Wii = data
})


module.exports = Wii