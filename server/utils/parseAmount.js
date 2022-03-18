const parseAmount = (amount) => {
  return Number(amount.replace(/[$.]/g, ''))
}

module.exports = parseAmount