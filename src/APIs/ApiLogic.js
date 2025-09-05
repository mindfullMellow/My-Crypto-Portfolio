let assetList = [];
let inactivityTimeout;
let fetchingPromise = null; // ✅ Track fetch state

// 🗂 Load cached data
const cached = JSON.parse(localStorage.getItem("asset_data"));
const now = Date.now();
const lastUpdated = Number(localStorage.getItem("asset_last_updated")) || 0;

// 🧹 Auto-delete if data is older than 30 mins
if (now - lastUpdated > 30 * 60 * 1000) {
  localStorage.removeItem("asset_data");
  localStorage.removeItem("asset_last_updated");
  console.log("🧹 Cache cleared after 30 mins");
} else if (cached && cached.coins) {
  assetList = cached.coins;
  console.log("✅ Loaded from cache:", assetList);
}

// ✅ MODIFIED: now returns a promise and sets global fetch state
function fetchIfNeeded() {
  const lastUpdated = Number(localStorage.getItem("asset_last_updated")) || 0;
  const now = Date.now();

  if (
    document.visibilityState === "visible" &&
    now - lastUpdated > 10000 &&
    !fetchingPromise // only fetch if not already fetching
  ) {
    fetchingPromise = fetch(
      "https://lucky-resonance-c4e1.samueldaniel4198.workers.dev"
    )
      .then((res) => res.json())
      .then((data) => {
        assetList = data.coins || [];
        localStorage.setItem("asset_data", JSON.stringify(data));
        localStorage.setItem("asset_last_updated", Date.now().toString());
        console.log("🌐 Fetched & updated:", assetList);
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
      })
      .finally(() => {
        fetchingPromise = null;
      });
  }

  return fetchingPromise || Promise.resolve(); // ✅ always return a Promise
}

// Auto-fetch every 5s
let fetchInterval = setInterval(fetchIfNeeded, 5000);

// ⏸ Stop fetching after 5 mins inactivity
function resetInactivityTimer() {
  clearTimeout(inactivityTimeout);
  inactivityTimeout = setTimeout(() => {
    clearInterval(fetchInterval);
    fetchInterval = null;
    console.log("⛔️ Stopped fetch due to inactivity");
  }, 5 * 60 * 1000); // 5 mins

  // 🟢 Restart fetch if it was stopped
  if (!fetchInterval) {
    fetchInterval = setInterval(fetchIfNeeded, 5000);
    console.log("▶️ Resumed fetch after activity");
  }
}
document.addEventListener("mousemove", resetInactivityTimer);
document.addEventListener("keydown", resetInactivityTimer);
resetInactivityTimer();

// Update if another tab modifies localStorage
window.addEventListener("storage", (e) => {
  if (e.key === "asset_data") {
    const newData = JSON.parse(e.newValue);
    assetList = newData.coins || [];
    console.log("🔄 Updated from other tab:", assetList);
  }
});

// ✅ MODIFIED: now waits for fetch to finish before returning list
export async function getAssetList() {
  await fetchIfNeeded(); // make sure data is ready
  return assetList;
}

export function getLastUpdated() {
  return Number(localStorage.getItem("asset_last_updated") || Date.now());
}
