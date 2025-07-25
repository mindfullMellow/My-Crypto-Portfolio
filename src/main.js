"use strict";

import "./main.css";

//Code to fetch data from the flask server

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
      updateDOM(); // Update UI
      console.log(coinData);
    })
    .catch((error) => {
      console.error("Fetch error:", error.message);
      updateDOM(true); // Update UI with error
    });
}

function updateDOM(hasError = false) {
  const totalValueEl = document.getElementById("total-value");
  const pnlValueEl = document.getElementById("pnl-value");
  const dailychangeEl = document.getElementById("24hr-change");
  const assetTableEl = document.getElementById("asset-table");

  if (hasError) {
    if (totalValueEl) totalValueEl.innerText = "Error fetching data";
    if (pnlValueEl) pnlValueEl.innerText = "P&L: Error";
    if (assetTableEl) assetTableEl.querySelector("tbody").innerHTML = "";
    return;
  }
  // protfoilio value
  if (totalValueEl)
    totalValueEl.innerText = `$${coinData.total_usd_value.toFixed(2)}`;

  //24 hr PNL
  if (pnlValueEl) {
    pnlValueEl.innerText = `${coinData.pnl.value.toFixed(2)}`;
  }

  //24hr change
  if (dailychangeEl) {
    const dayChange =
      coinData.pnl["24hr_change"].toFixed(2) < 0 ? "#da0b35" : "#0bda35";
    dailychangeEl.innerText = `${coinData.pnl["24hr_change"].toFixed(2)}%`;
    dailychangeEl.style.color = dayChange;
  }

  if (assetTableEl) {
    const tbody = assetTableEl.querySelector("tbody");
    tbody.innerHTML = "";
    const sortedAssets = Object.entries(coinData.assets).sort(
      ([, a], [, b]) => b.usd_value - a.usd_value
    );
    for (const [asset, info] of sortedAssets) {
      if (info.usd_value <= 1) continue; // Skip assets with value <= $1
      const price =
        info.amount > 0 ? (info.usd_value / info.amount).toFixed(2) : 0;
      const changeClass =
        info.price_change_24h < 0 ? "text-change-red" : "text-change-green";
      const row = `<tr class="border-t border-t-tabel-top-border">
        <td class="h-[72px] px-4 py-2 w-[400px]">${asset}<span class="ml-2">(${asset})</span></td>
        <td class="h-[72px] px-4 py-2 w-[400px]">$${price}</td>
        <td class="h-[72px] px-4 py-2 w-[400px]">${info.amount.toFixed(8)}</td>
        <td class="h-[72px] px-4 py-2 w-[400px]">$${info.usd_value.toFixed(
          2
        )}</td>
        <td class="h-[72px] px-4 py-2 w-[400px] ${changeClass}">${info.price_change_24h.toFixed(
        2
      )}%</td>
      </tr>`;
      tbody.innerHTML += row;
    }
  }
}

fetchPortfolio(); // Initial fetch
setInterval(fetchPortfolio, 10000); // Poll every 10 seconds

// code to dynamically implement the mobile nav logic

const buttonEL = document.querySelector(".btn-mobile-nav");
const headerEl = document.querySelector(".header-sm");

buttonEL.addEventListener("click", function () {
  headerEl.classList.toggle("nav-open");
});
