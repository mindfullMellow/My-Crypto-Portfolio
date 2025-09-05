"use strict";
import "./main.css";

import {
  finalPortfolioData,
  getCompletePortfolioData,
} from "../src/APIs/fecth_vps_data";

let portfolioData = {}; // Store fetched data
const logoMap = {
  Binance:
    "<img src='Assets/img/Binance-logo.svg' alt='Binance' class='w-8 h-8 mr-2'>",
  Bitget:
    "<img src='Assets/img/bitget-logo.png' alt='Bitget' class='w-6 h-6 mr-2'>",
  "Gate.io":
    "<img src='Assets/img/gate_io-logo.svg' alt='Gate' class='w-10 h-10 mr-2'>",
  Bybit:
    "<img src='Assets/img/bybit-logo.png' alt='Bybit' class='w-8 h-8 mr-2'>",
};

async function fetchPortfolio() {
  try {
    // Get fresh portfolio data
    const data = await getCompletePortfolioData();
    portfolioData = data;
    console.log(
      "Fetched portfolio data:",
      data.summary.totalValue,
      data.mergedAssets
    );
    updateDOM(); // Update UI
  } catch (error) {
    console.error("Fetch error:", error.message);
    updateDOM(true); // Update UI with error
  }
}

function updateDOM(hasError = false) {
  const totalValueEl = document.getElementById("total-value");
  const pnlValueEl = document.getElementById("pnl-value");
  const dailychangeEl = document.getElementById("24hr-change");
  const assetTableEl = document.getElementById("asset-table");

  if (hasError || !portfolioData.summary) {
    if (totalValueEl) totalValueEl.innerHTML = "Error loading data";
    if (pnlValueEl) pnlValueEl.innerHTML = "...";
    if (dailychangeEl) dailychangeEl.innerHTML = "...";
    if (assetTableEl) {
      const tbody = assetTableEl.querySelector("tbody");
      tbody.innerHTML = `
        <tr class="border-t border-t-tabel-top-border">
          <td class="h-[72px] px-4 py-2 w-[400px]">Error loading assets</td>
          <td class="h-[72px] px-4 py-2 w-[400px]">...</td>
          <td class="h-[72px] px-4 py-2 w-[400px]">...</td>
          <td class="h-[72px] px-4 py-2 w-[400px]">...</td>
          <td class="h-[72px] px-4 py-2 w-[400px]">...</td>
          <td class="h-[72px] px-4 py-2 w-[400px]">...</td>
        </tr>
      `;
    }
    return;
  }

  // Portfolio total value
  if (totalValueEl) {
    totalValueEl.innerHTML = `$${parseFloat(
      portfolioData.summary.totalValue
    ).toFixed(2)}`;
  }

  // PNL - We don't have PNL in merged data, so show placeholder or calculate if needed
  if (pnlValueEl) {
    pnlValueEl.innerHTML = "N/A"; // Or calculate based on your needs
  }

  // 24hr change - We don't have overall 24hr change, so show placeholder
  if (dailychangeEl) {
    dailychangeEl.innerHTML = "N/A"; // Or calculate average change
    dailychangeEl.style.color = "#666";
  }

  // Asset table with merged data
  if (assetTableEl) {
    const tbody = assetTableEl.querySelector("tbody");
    tbody.innerHTML = "";

    // Sort merged assets by total value
    const sortedAssets = Object.entries(portfolioData.mergedAssets).sort(
      ([, a], [, b]) => parseFloat(b.totalValue) - parseFloat(a.totalValue)
    );

    for (const [assetSymbol, assetInfo] of sortedAssets) {
      console.log(assetInfo);
      // Skip assets with very low value
      if (parseFloat(assetInfo.totalValue) <= 1) continue;

      // Get price directly from merged asset (with fallback to calculated)
      const assetPrice = assetInfo.price
        ? parseFloat(assetInfo.price).toFixed(2)
        : parseFloat(assetInfo.totalAmount) > 0
        ? (
            parseFloat(assetInfo.totalValue) / parseFloat(assetInfo.totalAmount)
          ).toFixed(2)
        : "0.00";

      // Get 24hr change from merged asset
      console.log(assetInfo.change24hr);
      const change24hr = assetInfo.change24hr || 0;
      const changeClass =
        change24hr === 0
          ? "text-gray-500"
          : change24hr > 0
          ? "text-change-green"
          : "text-change-red";
      const changeDisplay =
        change24hr !== 0
          ? `${change24hr > 0 ? "+" : ""}${change24hr.toFixed(2)}%`
          : "0.00%";

      // change24hr >= 0 ? "text-change-green" : "text-change-red";
      // Create exchange badges/logos
      const exchangeBadges = assetInfo.exchanges
        .map((ex) => {
          const exchangeName = ex.exchange;
          // You can replace these with actual logo images later
          return `<span title="${exchangeName}: ${parseFloat(ex.amount).toFixed(
            8
          )}" class="inline-block mr-1">${
            logoMap[exchangeName] || "⚪"
          }</span>`;
        })
        .join("");

      const row = `<tr class="border-t border-t-tabel-top-border">
  <td class="h-[72px] px-4 py-2 w-[400px]">${assetSymbol}</td>
  <td class="h-[72px] px-4 py-2 w-[400px]">$${assetPrice}</td>
  <td class="h-[72px] px-4 py-2 w-[400px]">${parseFloat(
    assetInfo.totalAmount
  ).toFixed(8)}</td>
  <td class="h-[72px] px-4 py-2 w-[400px]">$${parseFloat(
    assetInfo.totalValue
  ).toFixed(2)}</td>
  <td class="h-[72px] px-4 py-2 w-[400px] ${changeClass}">${changeDisplay}</td>
  <td class="h-[72px] px-4 py-2 w-[400px]"><span class="flex items-center">${exchangeBadges}</span></td>
</tr>`;
      tbody.innerHTML += row;
    }
  }
}

// Initialize portfolio display
async function initializePortfolio() {
  try {
    // Check if data is already loaded
    if (finalPortfolioData) {
      portfolioData = finalPortfolioData;
      updateDOM();
    } else {
      // Load data for first time
      const data = await getCompletePortfolioData();
      portfolioData = data;
      updateDOM();
    }
  } catch (error) {
    console.error("Error initializing portfolio:", error);
    updateDOM(true);
  }
}

// Initial load
initializePortfolio();

// Refresh every 30 seconds (reduced frequency since we're hitting multiple APIs)
// setInterval(fetchPortfolio, 30000);

///////////////////////////////////////////////////////////////////////
// code to dynamically implement the mobile nav logic

const buttonEL = document.querySelector(".btn-mobile-nav");
const headerEl = document.querySelector(".header-sm");
const profileMobile = document.querySelector("#mobile-profile");
const mainNavEL = document.querySelector(".main-nav");

buttonEL.addEventListener("click", function () {
  headerEl.classList.toggle("nav-open");
});

// intersection observer for automatically closing nav-open
const obsMainNav = new IntersectionObserver(
  function (entries) {
    const ent = entries[0];

    // close the nav-open when user leaves it visible section
    if (
      ent.isIntersecting === false &&
      headerEl.classList.contains("nav-open")
    ) {
      headerEl.classList.remove("nav-open");
    }
  },

  {
    // in the viewport
    root: null,
    threshold: 0,
    rootMargin: "-80px",
  }
);

// calling the intersection functions
obsMainNav.observe(mainNavEL);

///////////////////////////////////////////////////////////////////////
// MODAL logic
const overlayEL = document.querySelector(".overlay");
const zIndex = document.querySelector(".btn-mobile-nav");
const profileBtn = document.querySelectorAll(".profile-btn");
const profileModal = document.querySelectorAll(".profile-modal");

///////////////////////////////////////////////
//storing functions
const openProfileModal = function () {
  overlayEL.classList.remove("hidden");
  zIndex.classList.remove("z-50");
  for (let i = 0; i < profileModal.length; i++) {
    profileModal[i].classList.replace("hidden", "flex");
  }
};

const closeProfileModal = function (e) {
  if (e.target === overlayEL) {
    overlayEL.classList.add("hidden");
    zIndex.classList.add("z-50");
    for (let i = 0; i < profileModal.length; i++) {
      profileModal[i].classList.replace("flex", "hidden");
    }
  }
};

//show modal when the profile is clicked
for (let i = 0; i < profileBtn.length; i++) {
  profileBtn[i].addEventListener("click", openProfileModal);
}

// close modal when overlay is clicked
overlayEL.addEventListener("click", closeProfileModal);

/////////////////////////////////////////////////
// code to get current year
const Newyear = new Date().getFullYear();
document.getElementById("year").textContent = Newyear;
