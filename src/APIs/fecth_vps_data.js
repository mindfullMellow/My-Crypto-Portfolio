"use strict";

// Import the UniversalLoader
import UniversalLoader from "../extras/universal_loader.js";

export const VPSkey = import.meta.env.VITE_VPS_API_KEY;

// Function to get data by just inputting the route
export async function fetch_From_VPS(route) {
  try {
    const res = await fetch(`http://176.123.2.135:5001/${route}`, {
      headers: {
        "X-API-KEY": VPSkey,
      },
    });

    if (!res.ok) throw new Error(`Failed to fetch ${route}`);

    return await res.json();
  } catch (err) {
    console.error(err);
    throw err; // Re-throw to handle in the calling function
  }
}

// Main function using Option 2: Individual loading for each exchange
export async function fetchExchangeDataWithProgress() {
  const exchanges = [
    { name: "Binance", route: "binance-data", key: "binanceAsset" },
    { name: "Bitget", route: "bitget-assets", key: "bitgetAsset" },
    { name: "Gate.io", route: "gate-assets", key: "gate_ioAssets" },
    { name: "Bybit", route: "bybit-assets", key: "bybitAssets" },
  ];

  const assetData = {};

  // Initialize the loader
  UniversalLoader.show("Initializing connection...");

  try {
    for (let i = 0; i < exchanges.length; i++) {
      const exchange = exchanges[i];

      // Update loading message for current exchange
      UniversalLoader.loadingText.textContent = `Loading ${
        exchange.name
      } data... (${i + 1}/${exchanges.length})`;

      // Fetch data from current exchange
      const data = await fetch_From_VPS(exchange.route);
      assetData[exchange.key] = { ...data.assets };

      // Small delay to show progress (gives user visual feedback)
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // Final processing step
    UniversalLoader.loadingText.textContent =
      "Processing and combining data...";
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log(assetData);
    return assetData;
  } catch (error) {
    console.error("Error fetching exchange data:", error);

    // Show error message briefly before hiding
    UniversalLoader.loadingText.textContent = "Error loading data...";
    await new Promise((resolve) => setTimeout(resolve, 1000));

    throw error; // Re-throw for caller to handle
  } finally {
    // Always hide the loader
    UniversalLoader.hide();
  }
}

// Function to merge assets from all exchanges and calculate totals for duplicates
function mergeAndCalculateAssets(assetData) {
  const mergedAssets = {};

  // Iterate through each exchange
  Object.keys(assetData).forEach((exchangeKey) => {
    const exchangeAssets = assetData[exchangeKey];

    // Iterate through each asset in the current exchange
    Object.keys(exchangeAssets).forEach((assetSymbol) => {
      const asset = exchangeAssets[assetSymbol];

      if (mergedAssets[assetSymbol]) {
        // Asset already exists, add the amounts together
        mergedAssets[assetSymbol] = {
          symbol: asset.symbol || assetSymbol,
          totalAmount: (
            parseFloat(mergedAssets[assetSymbol].totalAmount) +
            parseFloat(asset.free || asset.amount || 0)
          ).toFixed(8),
          totalValue: asset.usd_value
            ? (
                parseFloat(mergedAssets[assetSymbol].totalValue || 0) +
                parseFloat(asset.usd_value)
              ).toFixed(2)
            : mergedAssets[assetSymbol].totalValue,
          exchanges: [
            ...mergedAssets[assetSymbol].exchanges,
            {
              exchange: getExchangeName(exchangeKey),
              amount: parseFloat(asset.free || asset.amount || 0).toFixed(8),
              value: asset.usd_value
                ? parseFloat(asset.usd_value).toFixed(2)
                : null,
            },
          ],
        };
      } else {
        // First time seeing this asset
        mergedAssets[assetSymbol] = {
          symbol: asset.symbol || assetSymbol,
          totalAmount: parseFloat(asset.free || asset.amount || 0).toFixed(8),
          totalValue: asset.usd_value
            ? parseFloat(asset.usd_value).toFixed(2)
            : null,
          exchanges: [
            {
              exchange: getExchangeName(exchangeKey),
              amount: parseFloat(asset.free || asset.amount || 0).toFixed(8),
              value: asset.usd_value
                ? parseFloat(asset.usd_value).toFixed(2)
                : null,
            },
          ],
        };
      }
    });
  });

  return mergedAssets;
}

// Helper function to get readable exchange names
function getExchangeName(exchangeKey) {
  const exchangeNames = {
    binanceAsset: "Binance",
    bitgetAsset: "Bitget",
    gate_ioAssets: "Gate.io",
    bybitAssets: "Bybit",
  };

  return exchangeNames[exchangeKey] || exchangeKey;
}

// Function to get summary statistics
function getAssetSummary(mergedAssets) {
  const summary = {
    totalUniqueAssets: Object.keys(mergedAssets).length,
    totalValue: 0,
    assetsByExchangeCount: {},
    topAssetsByValue: [],
  };

  Object.keys(mergedAssets).forEach((symbol) => {
    const asset = mergedAssets[symbol];

    // Add to total value if available
    if (asset.totalValue) {
      summary.totalValue += parseFloat(asset.totalValue);
    }

    // Count assets by exchange presence
    const exchangeCount = asset.exchanges.length;
    summary.assetsByExchangeCount[exchangeCount] =
      (summary.assetsByExchangeCount[exchangeCount] || 0) + 1;

    // Collect for top assets ranking
    if (asset.totalValue) {
      summary.topAssetsByValue.push({
        symbol,
        value: parseFloat(asset.totalValue),
        exchanges: asset.exchanges.length,
      });
    }
  });

  // Sort top assets by value
  summary.topAssetsByValue.sort((a, b) => b.value - a.value);
  summary.topAssetsByValue = summary.topAssetsByValue.slice(0, 10); // Top 10

  summary.totalValue = summary.totalValue.toFixed(2);

  return summary;
}

// Global variable to store the final processed data
export let finalPortfolioData = null;

// Main function to get all processed portfolio data
export async function getCompletePortfolioData() {
  try {
    // Customize the loader appearance for crypto theme
    UniversalLoader.customize({
      brandText: "CryptoTracker",
      colors: ["#f7931a", "#00d4aa", "#3c90eb"], // Bitcoin orange, crypto green, crypto blue
    });

    const assetData = await fetchExchangeDataWithProgress();

    console.log("Successfully loaded all exchange data:", assetData);

    // Show loader during processing
    UniversalLoader.show("Processing portfolio data...");

    // Merge all assets and calculate totals for duplicates
    const mergedAssets = mergeAndCalculateAssets(assetData);
    console.log("Merged assets with calculated totals:", mergedAssets);

    // Get summary statistics
    const summary = getAssetSummary(mergedAssets);
    console.log("Portfolio Summary:", summary);

    // Find assets that exist on multiple exchanges
    const multiExchangeAssets = Object.keys(mergedAssets).filter(
      (symbol) => mergedAssets[symbol].exchanges.length > 1
    );
    console.log("Assets found on multiple exchanges:", multiExchangeAssets);

    // Create the final data object
    const processedData = {
      rawData: assetData, // Original data from each exchange
      mergedAssets, // Combined assets with totals
      summary, // Portfolio statistics
      multiExchangeAssets, // Assets found on multiple exchanges
      lastUpdated: new Date().toISOString(),
    };

    // Store in global variable for access
    finalPortfolioData = processedData;

    console.log("🚀 Final Portfolio Data Ready:", processedData);

    return processedData;
  } catch (error) {
    console.error("Failed to load exchange data:", error);
    throw error;
  } finally {
    // Always hide the loader when everything is done
    UniversalLoader.hide();
  }
}

// Execute automatically when module loads
(async () => {
  try {
    await getCompletePortfolioData();
  } catch (error) {
    console.error("Auto-initialization failed:", error);
  }
})();
