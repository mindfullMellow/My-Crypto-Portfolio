"use strict";
import UniversalLoader from "../extras/universal_loader.js";

// Global variables
export let finalPortfolioData = null;
export const VPSkey = import.meta.env.VITE_VPS_API_KEY;

// Silent background refresh variables
let backgroundRefreshInterval = null;
const REFRESH_INTERVAL = 60000; // 1 minute
let isManualRefresh = true; // Flag to track manual vs silent refresh

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

// Initialize loader at module load time
initializeLoader();

// Show loader immediately for manual refresh
if (typeof window !== "undefined") {
  UniversalLoader.show("Initializing connection...");
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

// Silent fetch function (no loader, no delays)
async function silentFetchExchangeData(exchange) {
  try {
    const data = await fetch_From_VPS(exchange.route);
    return { [exchange.key]: { ...data.assets } };
  } catch (error) {
    console.warn(`Silent refresh failed for ${exchange.name}:`, error);
    return null;
  }
}

// Silent fetch all exchanges
async function silentFetchAllExchanges() {
  const assetData = {};

  for (let i = 0; i < EXCHANGES.length; i++) {
    const exchangeData = await silentFetchExchangeData(EXCHANGES[i]);
    if (exchangeData) {
      Object.assign(assetData, exchangeData);
    }
  }
  return assetData;
}

// Fetch hourly data
const RawHourlyData = await fetch_From_VPS("calcs-data");
console.log(RawHourlyData);
const hourlyData = RawHourlyData.days;
const lastTwoDaySnapshot = Object.keys(hourlyData)
  .slice(-2)
  .map((days) => ({ [days]: hourlyData[days] }));
console.log(lastTwoDaySnapshot);

// This variable contains the last 24 hours data
const MainHourData = lastTwoDaySnapshot
  .flatMap((dayObj) => {
    const key = Object.keys(dayObj)[0];
    return dayObj[key];
  })
  .map((item) => ({
    time: item.time,
    total: item.total_portfolio_usd,
  }))
  .slice(-24);

console.log("24Hour data ", MainHourData);

// This variable contains the 24hr totals
let Twenty_four_totals = MainHourData.map((cur) => cur.total);
console.log(Twenty_four_totals);

// Function to calc the 24hr change and 24hr pnl
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

  return Math.floor(_24hr_pnl * 100) / 100;
}

// Changed from const to let so these variables can be updated during silent background refresh
export let _24hr_percent_change = calc_24hr_percent(Twenty_four_totals);
export let _24hr_pnl = calc_24hr_pnl(Twenty_four_totals);

console.log(calc_24hr_percent(Twenty_four_totals));
console.log(calc_24hr_pnl(Twenty_four_totals));

// Silent hourly data fetch
async function silentFetchHourlyData() {
  try {
    const RawHourlyData = await fetch_From_VPS("calcs-data");
    const hourlyData = RawHourlyData.days;
    const lastTwoDaySnapshot = Object.keys(hourlyData)
      .slice(-2)
      .map((days) => ({ [days]: hourlyData[days] }));

    const MainHourData = lastTwoDaySnapshot
      .flatMap((dayObj) => {
        const key = Object.keys(dayObj)[0];
        return dayObj[key];
      })
      .map((item) => ({
        time: item.time,
        total: item.total_portfolio_usd,
      }))
      .slice(-24);

    const Twenty_four_totals = MainHourData.map((cur) => cur.total);

    return {
      _24hr_percent_change: calc_24hr_percent(Twenty_four_totals),
      _24hr_pnl: calc_24hr_pnl(Twenty_four_totals),
    };
  } catch (error) {
    console.warn("Silent hourly refresh failed:", error);
    return null;
  }
}

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
      const asset24hrChange = asset.price_change_24h || 0;

      if (mergedAssets[assetSymbol]) {
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
          price:
            newTotalValue && newTotalAmount > 0
              ? (newTotalValue / newTotalAmount).toFixed(8)
              : assetPrice
              ? assetPrice.toFixed(8)
              : null,
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
          change24hr: asset24hrChange || 0,
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

    if (asset.totalValue) {
      summary.totalValue += parseFloat(asset.totalValue);
    }

    const exchangeCount = asset.exchanges.length;
    summary.assetsByExchangeCount[exchangeCount] =
      (summary.assetsByExchangeCount[exchangeCount] || 0) + 1;

    if (asset.totalValue) {
      summary.topAssetsByValue.push({
        symbol,
        value: parseFloat(asset.totalValue),
        exchanges: asset.exchanges.length,
      });
    }
  });

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

// Main silent background refresh function
async function performSilentBackgroundRefresh() {
  try {
    console.log("🔄 Silent background refresh...");
    isManualRefresh = false; // Ensure no loader interference

    const assetData = await silentFetchAllExchanges();
    const hourlyResult = await silentFetchHourlyData();

    if (assetData && Object.keys(assetData).length > 0) {
      const mergedAssets = mergeAndCalculateAssets(assetData);
      const summary = generatePortfolioSummary(mergedAssets);
      const multiExchangeAssets = findMultiExchangeAssets(mergedAssets);

      finalPortfolioData = createProcessedDataObject(
        assetData,
        mergedAssets,
        summary,
        multiExchangeAssets
      );
    }

    if (hourlyResult) {
      _24hr_percent_change = hourlyResult._24hr_percent_change;
      _24hr_pnl = hourlyResult._24hr_pnl;
      console.log(
        "Updated 24hr data - Percent:",
        _24hr_percent_change,
        "%, PNL:",
        _24hr_pnl
      );
    }

    console.log("✅ Silent refresh done");

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("portfolioDataUpdated", {
          detail: {
            timestamp: new Date().toISOString(),
            hasNewData: true,
          },
        })
      );
    }
  } catch (error) {
    console.warn("Silent refresh error:", error);
  }
}

// Function to start background refresh
function startBackgroundRefresh() {
  if (backgroundRefreshInterval) {
    clearInterval(backgroundRefreshInterval);
  }
  backgroundRefreshInterval = setInterval(
    performSilentBackgroundRefresh,
    REFRESH_INTERVAL
  );
  console.log("🚀 Background refresh started - every 1 minute");
}

// Function to stop background refresh
export function stopBackgroundRefresh() {
  if (backgroundRefreshInterval) {
    clearInterval(backgroundRefreshInterval);
    backgroundRefreshInterval = null;
    console.log("⏹️ Background refresh stopped");
  }
}

// Main exported function - orchestrates everything
export async function getCompletePortfolioData() {
  try {
    if (isManualRefresh) {
      UniversalLoader.show("Initializing connection...");
    }

    const assetData = await fetchAllExchanges();
    console.log("Successfully loaded all exchange data:", assetData);

    if (isManualRefresh) {
      UniversalLoader.loadingText.textContent = "Processing portfolio data...";
    }
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mergedAssets = mergeAndCalculateAssets(assetData);
    const summary = generatePortfolioSummary(mergedAssets);
    const multiExchangeAssets = findMultiExchangeAssets(mergedAssets);

    const processedData = createProcessedDataObject(
      assetData,
      mergedAssets,
      summary,
      multiExchangeAssets
    );

    finalPortfolioData = processedData;

    return processedData;
  } catch (error) {
    console.error("Failed to load exchange data:", error);
    if (isManualRefresh) {
      UniversalLoader.loadingText.textContent = "Error loading data...";
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw error;
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
    startBackgroundRefresh();
  } catch (error) {
    console.error("Auto-initialization failed:", error);
  } finally {
    isManualRefresh = false; // Reset for silent refreshes
  }
})();

// Clean up on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", stopBackgroundRefresh);
}
