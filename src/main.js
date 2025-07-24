"use strict";

import "./main.css";

let coinData = {}; // Store fetched data

function fetchPortfolio() {
  fetch("http://127.0.0.1:5000/binance-calc")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      coinData = data; // Store data
      console.log("Fetched data:", data.total_usd_value, data.pnl);
      // Update DOM here (e.g., document.getElementById('total-value').innerText = data.total_usd_value)
    })
    .catch((error) => {
      console.error("Fetch error:", error.message);
    });
}

console.log(coinData);

fetchPortfolio(); // Initial fetch
setInterval(fetchPortfolio, 10000); // Poll every 10 seconds
