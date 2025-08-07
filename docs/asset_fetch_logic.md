# Asset Fetch Logic (Frontend)

This script manages how the frontend fetches and shares asset data across multiple browser tabs using `localStorage`.

## 🔧 What It Does

1. **Loads Cached Data Immediately**

   - If data exists in `localStorage` (`asset_data`), it's loaded right away.

2. **Fetches New Data (Only When Needed)**

   - Every **1 second**, the code checks:
     - Is the tab **visible** (active)?
     - Is the last data **older than 10 seconds**?
   - If both are true, it fetches fresh data from the Worker and:
     - Saves it to `localStorage`.
     - Updates the UI (or asset list, if using `assetList`).

3. **Keeps Tabs in Sync**
   - If another tab updates `localStorage`, this tab listens and auto-updates the data (via the `storage` event).

## 🧠 Key Logic

- `asset_last_updated`: Timestamp in `ms` of last successful fetch.
- `asset_data`: Cached asset data (JSON stringified).
- `document.visibilityState === "visible"`: Ensures background tabs don't trigger fetches.
- `setInterval(fetchIfNeeded, 1000)`: Checks once per second.

## 📦 Benefits

- Reduces unnecessary API calls.
- Shares data between tabs.
- Respects Cloudflare Worker request limits.

## ⚠️ Notes

- All tabs share one data cache.
- Tabs still fetch if user leaves one tab open.
- Ensure `updateUI()` or similar logic is defined to handle the data.
