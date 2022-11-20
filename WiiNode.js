const BalanceBoard = require("wii-balance-board-pi")

const balanceBoard = new BalanceBoard()

let Wii


balanceBoard.connect()


module.exports = balanceBoard