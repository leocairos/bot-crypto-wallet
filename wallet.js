const coinPairs = [
  // {
  //     buyDate: "2021-11-26 07:18:45", 
  //     symbol:"BNBBTC", 
  //     baseAsset:"BNB", 
  //     quoteAsset:"BTC", 
  //     amountBase: 2, //BNB
  //     amountQuote: 0.0210588, //.BTC received 
  //     rate: 0.0105294, //1 BNB => 0.0105294 BTC
  //     rateUSD: 584.58, //1 BNB => 584.58
  //     amountUSD: 1169.16, // .USD => amountBase (2) * rateUSD (584.58)
  //     targetProfit: 0.05, // 5%
  //     stopLoss: 0.15, //15%
  // },
  {
      buyDate: "2021-11-24 22:25:45", 
      symbol:"MANAUSDT", 
      baseAsset:"USDT", 
      quoteAsset:"MANA", 
      amountBase: 48, //USDT
      amountQuote: 10.01454195, //.MANA received 
      rate: 4.79303, //1 MANA => 4.79303 USDT
      rateUSD: 4.8548, //1 MANA => 4.8548 BUSD
      amountUSD: 233.0304, //. USD => amountBase (48) * rateUSD (4.8548)
      targetProfit: 0.05, // 5%
      stopLoss: 0.15, //15%
  }
];

module.exports = { coinPairs }