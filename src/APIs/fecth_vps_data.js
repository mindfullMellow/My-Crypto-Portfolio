"use strict";
import UniversalLoader from "../extras/universal_loader.js";

// Global variables
export let finalPortfolioData = null;
export const VPSkey = import.meta.env.VITE_VPS_API_KEY;
const EXCHANGES = [
  { name: "Binance", route: "binance-data", key: "binanceAsset" },
  { name: "Bitget", route: "bitget-assets", key: "bitgetAsset" },
  { name: "Gate.io", route: "gate-assets", key: "gate_ioAssets" },
  { name: "Bybit", route: "bybit-assets", key: "bybitAssets" },
];

const EXCHANGE_NAMES = {
  binanceAsset: "Binance",
  bitgetAsset: "Bitget",
  gate_ioAssets: "Gate.io",
  bybitAssets: "Bybit",
};

// Basic fetch function
export async function fetch_From_VPS(route) {
  try {
    const res = await fetch(`/api/${route}`, {
      headers: {
        "X-API-KEY": VPSkey,
      },
    });

    if (!res.ok) throw new Error(`Failed to fetch ${route}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Initialize loader with crypto theme
function initializeLoader() {
  UniversalLoader.customize({
    brandText: "CoinTracker",
    colors: ["#f7931a", "#00d4aa", "#3c90eb"],
  });
}

// Fetch individual exchange data
async function fetchExchangeData(exchange, index, total) {
  UniversalLoader.loadingText.textContent = `Loading ${
    exchange.name
  } data... (${index + 1}/${total})`;

  const data = await fetch_From_VPS(exchange.route);

  // Small delay for visual feedback
  await new Promise((resolve) => setTimeout(resolve, 300));

  return { [exchange.key]: { ...data.assets } };
}

//fecth hourly data

// This cleans out the data and give only the last 2 days data before futher processing in MainHourData
const RawHourlyData = await fetch_From_VPS("calcs-data");
console.log(RawHourlyData);
const hourlyData = RawHourlyData.days;
const lastTwoDaySnapshot = Object.keys(hourlyData)
  .slice(-2)
  .map((days) => ({ [days]: hourlyData[days] }));
console.log(lastTwoDaySnapshot);

// This varaible contains the last24 hours data (if you dont understand this code in future:: just put a console.log before the chain cantantion and staor the next chain in a variable then repeat the process for the rest chaining methods)
const MainHourData = lastTwoDaySnapshot
  .flatMap((dayObj) => {
    const key = Object.keys(dayObj)[0]; // get the day key
    return dayObj[key]; // return the nested array
  })
  .map((item) => ({
    time: item.time,
    total: item.total_portfolio_usd,
  }))
  .slice(-24);

console.log("24Hour data ", MainHourData);

// this varibale contains the 24hr totals
let Twenty_four_totals = MainHourData.map((cur) => cur.total);
console.log(Twenty_four_totals);

// function to calc the 24hr chnage and 24hr pnl
function calc_24hr_percent(arr) {
  const latestTotal = arr[arr.length - 1];
  const Total_24hr_ago = arr[0];
  console.log(latestTotal, Total_24hr_ago);

  const _24hr_percent_change =
    ((latestTotal - Total_24hr_ago) / Total_24hr_ago) * 100;

  return Math.floor(_24hr_percent_change * 100) / 100;
}

function calc_24hr_pnl(arr) {
  const latestTotal = arr[arr.length - 1];
  const Total_24hr_ago = arr[0];
  const _24hr_pnl = latestTotal - Total_24hr_ago;

  // this is to give the first 2 decimals if i use fixed(2)it wil oundup the number and this can lead to inaccureate figures
  return Math.floor(_24hr_pnl * 100) / 100;
}

export const _24hr_percent_change = calc_24hr_percent(Twenty_four_totals);
export const _24hr_pnl = calc_24hr_pnl(Twenty_four_totals);

console.log(calc_24hr_percent(Twenty_four_totals));
console.log(calc_24hr_pnl(Twenty_four_totals));

// Fetch all exchanges sequentially with progress
async function fetchAllExchanges() {
  const assetData = {};

  for (let i = 0; i < EXCHANGES.length; i++) {
    const exchangeData = await fetchExchangeData(
      EXCHANGES[i],
      i,
      EXCHANGES.length
    );
    Object.assign(assetData, exchangeData);
  }

  return assetData;
}

// Get readable exchange name from key
function getExchangeName(exchangeKey) {
  return EXCHANGE_NAMES[exchangeKey] || exchangeKey;
}

// Merge assets from all exchanges and calculate totals
function mergeAndCalculateAssets(assetData) {
  const mergedAssets = {};

  Object.keys(assetData).forEach((exchangeKey) => {
    const exchangeAssets = assetData[exchangeKey];

    Object.keys(exchangeAssets).forEach((assetSymbol) => {
      const asset = exchangeAssets[assetSymbol];
      const assetAmount = parseFloat(asset.free || asset.amount || 0);
      const assetValue = asset.usd_value ? parseFloat(asset.usd_value) : 0;
      const assetPrice = asset.price ? parseFloat(asset.price) : null;
      const asset24hrChange = asset.price_change_24h || 0; // Use correct key from raw data

      if (mergedAssets[assetSymbol]) {
        // Asset exists, merge data
        const currentTotalAmount = parseFloat(
          mergedAssets[assetSymbol].totalAmount
        );
        const newTotalAmount = currentTotalAmount + assetAmount;
        const currentTotalValue = parseFloat(
          mergedAssets[assetSymbol].totalValue || 0
        );
        const newTotalValue = asset.usd_value
          ? currentTotalValue + assetValue
          : mergedAssets[assetSymbol].totalValue;

        mergedAssets[assetSymbol] = {
          ...mergedAssets[assetSymbol],
          totalAmount: newTotalAmount.toFixed(8),
          totalValue: newTotalValue ? newTotalValue.toFixed(2) : null,
          // Calculate average price: total value / total amount
          price:
            newTotalValue && newTotalAmount > 0
              ? (newTotalValue / newTotalAmount).toFixed(8)
              : assetPrice
              ? assetPrice.toFixed(8)
              : null,
          // Keep the most recent 24hr change (or use existing if current is 0)
          change24hr:
            asset24hrChange !== 0
              ? asset24hrChange
              : mergedAssets[assetSymbol].change24hr,
          exchanges: [
            ...mergedAssets[assetSymbol].exchanges,
            {
              exchange: getExchangeName(exchangeKey),
              amount: assetAmount.toFixed(8),
              value: asset.usd_value ? assetValue.toFixed(2) : null,
              price: assetPrice ? assetPrice.toFixed(8) : null,
            },
          ],
        };
      } else {
        // First time seeing this asset
        const finalPrice = assetPrice
          ? assetPrice.toFixed(8)
          : assetValue && assetAmount > 0
          ? (assetValue / assetAmount).toFixed(8)
          : null;

        mergedAssets[assetSymbol] = {
          symbol: asset.symbol || assetSymbol,
          totalAmount: assetAmount.toFixed(8),
          totalValue: asset.usd_value ? assetValue.toFixed(2) : null,
          price: finalPrice,
          change24hr: asset24hrChange || 0, // Default to 0 as mentioned
          exchanges: [
            {
              exchange: getExchangeName(exchangeKey),
              amount: assetAmount.toFixed(8),
              value: asset.usd_value ? assetValue.toFixed(2) : null,
              price: assetPrice ? assetPrice.toFixed(8) : null,
            },
          ],
        };
      }
    });
  });

  return mergedAssets;
}

// Generate portfolio summary statistics
function generatePortfolioSummary(mergedAssets) {
  const summary = {
    totalUniqueAssets: Object.keys(mergedAssets).length,
    totalValue: 0,
    assetsByExchangeCount: {},
    topAssetsByValue: [],
  };

  Object.keys(mergedAssets).forEach((symbol) => {
    const asset = mergedAssets[symbol];

    // Calculate total value
    if (asset.totalValue) {
      summary.totalValue += parseFloat(asset.totalValue);
    }

    // Count by exchange presence
    const exchangeCount = asset.exchanges.length;
    summary.assetsByExchangeCount[exchangeCount] =
      (summary.assetsByExchangeCount[exchangeCount] || 0) + 1;

    // Collect for ranking
    if (asset.totalValue) {
      summary.topAssetsByValue.push({
        symbol,
        value: parseFloat(asset.totalValue),
        exchanges: asset.exchanges.length,
      });
    }
  });

  // Sort and limit top assets
  summary.topAssetsByValue.sort((a, b) => b.value - a.value);
  summary.topAssetsByValue = summary.topAssetsByValue.slice(0, 10);
  summary.totalValue = summary.totalValue.toFixed(2);

  return summary;
}

// Find assets available on multiple exchanges
function findMultiExchangeAssets(mergedAssets) {
  return Object.keys(mergedAssets).filter(
    (symbol) => mergedAssets[symbol].exchanges.length > 1
  );
}

// Create final processed data object
function createProcessedDataObject(
  assetData,
  mergedAssets,
  summary,
  multiExchangeAssets
) {
  return {
    rawData: assetData,
    mergedAssets,
    summary,
    multiExchangeAssets,
    lastUpdated: new Date().toISOString(),
  };
}

// Main exported function - orchestrates everything
export async function getCompletePortfolioData() {
  try {
    // Initialize loader
    initializeLoader();
    UniversalLoader.show("Initializing connection...");

    // Fetch all exchange data
    const assetData = await fetchAllExchanges();
    console.log("Successfully loaded all exchange data:", assetData);

    // Process data
    UniversalLoader.loadingText.textContent = "Processing portfolio data...";
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mergedAssets = mergeAndCalculateAssets(assetData);
    // console.log("Merged assets with calculated totals:", mergedAssets);

    const summary = generatePortfolioSummary(mergedAssets);
    // console.log("Portfolio Summary:", summary);

    const multiExchangeAssets = findMultiExchangeAssets(mergedAssets);
    // console.log("Assets found on multiple exchanges:", multiExchangeAssets);

    // Create final data object
    const processedData = createProcessedDataObject(
      assetData,
      mergedAssets,
      summary,
      multiExchangeAssets
    );

    // Store globally
    finalPortfolioData = processedData;
    // console.log("🚀 Final Portfolio Data Ready:", processedData);

    return processedData;
  } catch (error) {
    console.error("Failed to load exchange data:", error);

    // Show error briefly
    UniversalLoader.loadingText.textContent = "Error loading data...";
    await new Promise((resolve) => setTimeout(resolve, 1000));

    throw error;
  } finally {
    UniversalLoader.hide();
  }
}

// Legacy function for compatibility
export async function fetchExchangeDataWithProgress() {
  return await getCompletePortfolioData();
}

// Auto-initialize when module loads
(async () => {
  try {
    await getCompletePortfolioData();
  } catch (error) {
    console.error("Auto-initialization failed:", error);
  }
})();
