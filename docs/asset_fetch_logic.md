# 📊 Asset Fetch Logic (Frontend)

This script handles **efficient asset data fetching**, **inactivity handling**, and **multi-tab sync** using `localStorage`.

---

## 🔧 What This Script Does

### 1. ✅ Loads Cached Data Immediately

- On page load, it checks `localStorage` for:
  - `asset_data` – saved coin data.
  - `asset_last_updated` – when the data was saved.
- If data is **less than 30 mins old**, it uses it directly.
- If data is **older than 30 mins**, it clears the cache.

---

### 2. 🌐 Fetches New Data Only When Needed

- A function `fetchIfNeeded()` runs every **1 second**.
- It fetches new data **only if**:
  - The page/tab is **visible** (`document.visibilityState === "visible"`).
  - Last update was more than **10 seconds ago**.
- If fetched:
  - It updates `assetList` in memory.
  - Saves new data to `localStorage` (`asset_data` and `asset_last_updated`).
  - Useful for keeping your UI up-to-date.

---

### 3. 🔁 Keeps All Browser Tabs in Sync

- When one tab updates the asset data in `localStorage`, all other tabs detect this using the `storage` event.
- They then update their own `assetList` immediately.

---

### 4. ⏸ Auto-Stops on Inactivity (To Save Resources)

- If the user is inactive for **5 minutes** (no mouse or keyboard):
  - It **stops the auto-fetch interval** to reduce network load.
- Once activity resumes:
  - The interval **automatically restarts**.

---

## 🧠 Core Concepts & Variables

| Key                                | Description                                                   |
| ---------------------------------- | ------------------------------------------------------------- |
| `asset_data`                       | JSON string of latest fetched coins, saved in `localStorage`. |
| `asset_last_updated`               | Timestamp of last successful fetch (in milliseconds).         |
| `assetList`                        | Main in-memory variable holding coin data.                    |
| `document.visibilityState`         | Used to skip fetches when the tab is not active.              |
| `setInterval(fetchIfNeeded, 1000)` | Checks for fresh data every second.                           |
| `setTimeout()`                     | Used to track and handle inactivity.                          |

---

## 📦 Benefits

- ⚡ Loads cached data instantly (no waiting on fetch).
- 🧠 Avoids duplicate fetches across tabs.
- 💾 Saves API calls using smart cache + visibility logic.
- 🔒 Prevents wasting resources during user inactivity.
- 🔁 Keeps all open tabs synced with the latest data.

---

## ⚠️ Things to Keep in Mind

- Only **one fetch per browser session**, even with multiple tabs.
- Fetch resumes **only if user is active** on the page.
- Make sure your UI code (like `updateUI()`) is linked to `assetList` so new data shows up.
