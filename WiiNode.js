const BalanceBoard = require("wii-balance-board-pi")

const balanceBoard = new BalanceBoard()


balanceBoard.connect()


module.exports = balanceBoard
