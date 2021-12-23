// Relative Strength Index (RSI)
//. RSI = 100 - 100 / (1 + U / D)
function calcRSI(prices) {
  let ganhos = 0;
  let perdas = 0;
  for (let i = prices.length - 14; i < prices.length; i++) {
      const diferenca = prices[i] - prices[i - 1];
      if (diferenca >= 0)
          ganhos += diferenca;
      else
          perdas -= diferenca;
  }

  const forcaRelativa = ganhos / perdas;
  return 100 - (100 / (1 + forcaRelativa));
}

module.exports = { calcRSI }