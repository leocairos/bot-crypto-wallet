require('dotenv-safe').config();

const express = require('express');
const app = express();
app.use(express.json());

app.use('/', async (req, res) => {
    const result = await getLaunchInfoV2()
    return res.json(result);
})

const axios = require('axios');
const queryString = require('querystring');

const apiKey = process.env.API_KEY;
const apiUrl = process.env.API_URL;

const coinsLaunchDetail = [
    {
        token: 'Voxies',
        baseAsset: 'VOXEL',
        description: 'A Free-to-Play 3D RPG Game on the Blockchain.',
        launchpadHardCap: 6000000,
        totalTokenSupply: 300000000,
        tokensOffered: 30000000,
        salePriceInBNB: 0.00037894,
        salePriceInUSD: 0.2,
    },
    {
        token: 'FC Porto Fan Token',
        baseAsset: 'PORTO',
        description: 'A Binance Fan Token for FC Porto on Binance Smart Chain.',
        launchpadHardCap: 4000000,
        totalTokenSupply: 40000000,
        tokensOffered: 4000000,
        salePriceInBNB: 0.0016364,
        salePriceInUSD: 1,
    },
    {
        token: 'Lazio Fan Token',
        baseAsset: 'LAZIO',
        description: 'A Binance Fan Token for S.S. Lazio on Binance Smart Chain',
        launchpadHardCap: 4000000,
        totalTokenSupply: 40000000,
        tokensOffered: 4000000,
        salePriceInBNB: 0.00201329,
        salePriceInUSD: 1,
    },
    {
        token: 'Beta Finance',
        baseAsset: 'BETA',
        description: 'A permissionless money market for lending, borrowing, and short selling crypto',
        launchpadHardCap: 3000000,
        totalTokenSupply: 1000000000,
        tokensOffered: 50000000,
        salePriceInBNB: 0.00013828,
        salePriceInUSD: 0.06,
    },
    {
        token: 'Coin98',
        baseAsset: 'C98',
        description: 'A Multichain DeFi Platform',
        launchpadHardCap: 3750000,
        totalTokenSupply: 1000000000,
        tokensOffered: 50000000,
        salePriceInBNB: 0.00025041,
        salePriceInUSD: 0.075,
    },
]

// const coinLaunch = [ 
//     'VOXEL', 'PORTO', 'LAZIO', 'BETA', 
//     'C98', 'BAR', 'TKO', 'LINA',
//     'DEGO', 'ACM', 'SFP', 'AXS', 'INJ',
//     'ALPHA', 'SAND', 'CTSI']

async function publicCall(path, data, method = 'GET') {
    try {
        const qs = data ? `?${queryString.stringify(data)}` : '';
        const result = await axios({
            method,
            url: `${process.env.API_URL}${path}${qs}`
        });
        return result.data;
    } catch (err) {
        console.error(err);
    }
}

async function exchangeInfo() {
    const coinsInfo = await publicCall('/v3/exchangeInfo');
    const assets = coinsLaunchDetail.map(a => a.baseAsset);
    const coinsInfoFiltered = coinsInfo.symbols.filter(s => assets.includes(s.baseAsset));

    return coinsInfoFiltered;
}

async function trades(symbol, fromId = 0, limit = 10) {
    const path = '/v3/historicalTrades';

    if (!apiKey)
        throw new Error('Preencha corretamente sua API KEY');

    try {
        const result = await axios({
            method: 'GET',
            url: `${apiUrl}${path}?symbol=${symbol}&fromId=${fromId}&limit=${limit}`,
            headers: { 'X-MBX-APIKEY': apiKey }
        });
        return result.data;
    } catch (err) {
        console.log(err);
    }
}

function groupBy(objectArray, property) {
    return objectArray.reduce(function (acc, obj) {
        let key = obj[property];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj.quoteAsset);
        return acc;
    }, {});
}

const getLaunchInfoV2 = async () => {
    const coinPairs = (await exchangeInfo())
        .map(coinPair => {
            return {
                symbol: coinPair.symbol,
                baseAsset: coinPair.baseAsset,
                baseAssetPrecision: coinPair.baseAssetPrecision,
                quoteAsset: coinPair.quoteAsset,
                quotePrecision: coinPair.quotePrecision,
            }
        });

    const coinGroup = groupBy(coinPairs, 'baseAsset');
    const symbolsWithQuoteUSDT = coinPairs
        .filter(coin => coin.quoteAsset === 'USDT')
        .map(s => s.symbol)

    const consoleMode = process.argv[2]?.toUpperCase() === 'CONSOLE';

    if (consoleMode)
        console.log(
            'coinsLaunchDetail:', coinsLaunchDetail.length,
            'symbolsWithQuoteUSDT:', symbolsWithQuoteUSDT.length);

    const launchInfo = [];
    await Promise.all(
        symbolsWithQuoteUSDT.map(async (symbol) => {
            const symbolTrades = await trades(symbol, 0, 3)

            const coinPair = coinPairs.filter(coin => coin.symbol === symbol)[0];
            const coinDetail = coinsLaunchDetail.filter(coin => coin.baseAsset === coinPair.baseAsset)[0];

            const myObject = {
                ...coinPair,
                ...coinDetail,
                AllQuoteAssets: coinGroup[coinPair.baseAsset],
                tradesInUSDT: symbolTrades
            }
            launchInfo.push(myObject);

            if (consoleMode)
                console.log(myObject);
        })
    )

    return launchInfo;
}

switch (process.argv[2]?.toUpperCase()) {
    case 'CONSOLE':
        console.log(`run ${process.argv[2]?.toUpperCase()} mode...`);
        setTimeout(async () => {
            await getLaunchInfoV2();
            process.exit(0);
        }, 1000)
        break;

    default:
        const APP_PORT = 3301
        app.listen(APP_PORT, () => {
            console.log(`App is running in ${APP_PORT} port.`);
        });
}