require('dotenv-safe').config();

const axios = require('axios');
const WebSocket = require('ws');

// const { Telegraf } = require('telegraf');
// const bot = new Telegraf(`${process.env.BOT_TOKEN}`);

const baseUrlRest = 'https://api.binance.com/api/v3/klines?symbol='
const klineInterval = '1m'

const baseUrlWS = 'wss://stream.binance.com:9443/ws/'

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

const currency = "BUSD";
const coinPairs = [
    {
        buyDate: "2021-11-26 07:18:45", 
        symbol:"BNBBTC", 
        baseAsset:"BNB", 
        quoteAsset:"BTC", 
        amountBase: 2, //BNB
        amountQuote: 0.0210588, //.BTC received 
        rate: 0.0105294, //1 BNB => 0.0105294 BTC
        rateUSD: 584.58, //1 BNB => 584.58
        amountUSD: 1169.16, // .USD => amountBase (2) * rateUSD (584.58)
        targetProfit: 0.05, // 5%
        stopLoss: 0.15, //15%
    },
    {
        buyDate: "2021-11-24 22:25:45", 
        symbol:"MANAUSDT", 
        baseAsset:"USDT", 
        quoteAsset:"MANA", 
        amountBase: 48, //USDT
        amountQuote: 10.01454195, //.MANA received 
        rate: 0.20863629, //1 USDT => 0.20863629 MANA
        rateUSD: 584.58, //1 BNB => 584.58
        amountUSD: 1169.16, //. USD => amountBase (2) * rateUSD (584.58)
        targetProfit: 0.05, // 5%
        stopLoss: 0.15, //15%
    }
];

async function symbolMonitor(coinPair) {
    const urlRest = `${baseUrlRest}${(coinPair.symbol).toUpperCase()}&interval=${klineInterval}`;
    //console.log(`\n\n${urlRest}\n\n`)
    const candles = await axios.get(urlRest);
    const closes = candles.data.map(candle => parseFloat(candle[4]));

    const urlWs = `${baseUrlWS}${(coinPair.symbol).toLowerCase()}@kline_${klineInterval}`;
    const ws = new WebSocket(urlWs);

    ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.k.x) {
            // TODO: Validate URL, is better to this?
            const currencyValue = await axios.get(`https://api.binance.com/api/v3/ticker/bookTicker?symbol=${coinPair.quoteAsset}${currency}`)
            const askPrice = parseFloat(currencyValue.data.askPrice || 0)
            const balance = coinPair.amountQuote * askPrice
            // console.log(JSON.stringify(currencyValue.data))
            // console.log(askPrice)
            const profit = ( (data.k.c / coinPair.rate) -1) * 100
            const profitUSD = ( (balance / coinPair.amountUSD) - 1 ) * 100
            const difUSD = coinPair.amountUSD - balance
            const targetProfitValue = coinPair.amountUSD * (1 + coinPair.targetProfit)
            const stopLossValue = coinPair.amountUSD * (1 - coinPair.stopLoss)
            const isProfit = balance >= targetProfitValue
            const isLoss = balance <= stopLossValue
            //console.log(JSON.stringify(data));
            closes.push(parseFloat(data.k.c));
            // FIXME
            const rsi = calcRSI(closes);
            let messageLog = ` - buyRate: ${coinPair.rate} closeValue: ${data.k.c} RSI: ${rsi.toFixed(2)} `
            messageLog += `\n  - Profit pair [${(coinPair.symbol).toUpperCase()}]: ${profit.toFixed(2)}% `
            messageLog += `\n  - Profit USD: ${profitUSD.toFixed(2)}% (${difUSD.toFixed(2)} BUSD)`
            messageLog += `\n    - Target Profit[${isProfit}]: +${coinPair.targetProfit*100}% (${targetProfitValue.toFixed(2)} BUSD) `
            messageLog += `Stop Loss [${isLoss}]: -${coinPair.stopLoss*100}% (${stopLossValue.toFixed(2)} BUSD)`
            messageLog += `\n    - Balance: ${coinPair.amountQuote} ${coinPair.quoteAsset} `            
            messageLog += `=> ${balance.toFixed(2)} ${currency} `
            console.log(messageLog);
        }
    }

    console.log(`Connected [${(coinPair.symbol).toUpperCase()}] \n - ${urlRest} \n - ${urlWs}`);
}

(async () => {

    coinPairs.forEach(coinPair => symbolMonitor(coinPair))
  
    // const axios = require('axios');
    // const urlRest = `${baseUrlRest}${(coinPairs[0].symbol).toUpperCase()}&interval=${klineInterval}`;
    // const candles = await axios.get(urlRest);
    // const closes = candles.data.map(candle => parseFloat(candle[4]));

    // const WebSocket = require('ws');
    // const urlWs = `${baseUrlWS}${(coinPairs[0].symbol).toLowerCase()}@kline_${klineInterval}`;
    // const ws = new WebSocket(urlWs);

    // const { Telegraf } = require('telegraf');
    // const bot = new Telegraf(`${process.env.BOT_TOKEN}`);

    // ws.onmessage = async (event) => {
    //     const data = JSON.parse(event.data);
    //     if (data.k.x) {
    //         //toDo: Validate URL, is better to this?
    //         const currencyValue = await axios.get(`https://api.binance.com/api/v3/ticker/bookTicker?symbol=BTC${currency}`)
    //         const askPrice = parseFloat(currencyValue.data.askPrice || 0)
    //         const balance = coinPairs[0].amountQuote * askPrice
    //         // console.log(JSON.stringify(currencyValue.data))
    //         // console.log(askPrice)
    //         const profit = ( (data.k.c / coinPairs[0].rate) -1) * 100
    //         const profitUSD = ( (balance / coinPairs[0].amountUSD) - 1 ) * 100
    //         const difUSD = coinPairs[0].amountUSD - balance
    //         const targetProfitValue = coinPairs[0].amountUSD * (1 + coinPairs[0].targetProfit)
    //         const stopLossValue = coinPairs[0].amountUSD * (1 - coinPairs[0].stopLoss)
    //         const isProfit = balance >= targetProfitValue
    //         const isLoss = balance <= stopLossValue
    //         //console.log(JSON.stringify(data));
    //         closes.push(parseFloat(data.k.c));
    //         const rsi = calcRSI(closes);
    //         let messageLog = ` - buyRate: ${coinPairs[0].rate} closeValue: ${data.k.c} RSI: ${rsi.toFixed(2)} `
    //         messageLog += `\n  - Profit pair [${(coinPairs[0].symbol).toUpperCase()}]: ${profit.toFixed(2)}% `
    //         messageLog += `\n  - Profit USD: ${profitUSD.toFixed(2)}% (${difUSD.toFixed(2)} BUSD)`
    //         messageLog += `\n    - Target Profit[${isProfit}]: +${coinPairs[0].targetProfit*100}% (${targetProfitValue.toFixed(2)} BUSD) `
    //         messageLog += `Stop Loss [${isLoss}]: -${coinPairs[0].stopLoss*100}% (${stopLossValue.toFixed(2)} BUSD)`
    //         messageLog += `\n    - Balance: ${coinPairs[0].amountQuote} ${coinPairs[0].quoteAsset} `            
    //         messageLog += `=> ${balance.toFixed(2)} ${currency} `
    //         console.log(messageLog);
    //         //bot.telegram.sendMessage(process.env.CHAT_ID, `RSI ${(coinPairs[0].symbol).toUpperCase()}: ${rsi}`);
    //         // if (rsi > 70) {
    //         //     bot.telegram.sendMessage(process.env.CHAT_ID, 'Sobrecomprado!');
    //         //     console.log('Sobrecomprado!');
    //         // }
    //         // else if (rsi < 30) {
    //         //     bot.telegram.sendMessage(process.env.CHAT_ID, 'Sobrevendido!');
    //         //     console.log('Sobrevendido!');
    //         // }
    //     }
    // }

    // console.log(`Conectado [${(coinPairs[0].symbol).toUpperCase()}] \n - ${urlRest} \n - ${urlWs}`);

})()