"use strict";

import "./main.css";
import "./asset_quantity_calc";
// Function to apply animation to an element
function applyAnimation(element) {
  element.innerHTML = element.textContent
    .split("")
    .map(
      (char, index) =>
        `<span style="animation-delay: ${
          index * 0.1
        }s" class="dot">${char}</span>`
    )
    .join("");
}

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

  if (hasError || !coinData.total_usd_value) {
    if (totalValueEl) applyAnimation(totalValueEl);
    if (pnlValueEl) applyAnimation(pnlValueEl);
    if (dailychangeEl) applyAnimation(dailychangeEl);
    if (assetTableEl) {
      const tbody = assetTableEl.querySelector("tbody");
      tbody.innerHTML = `
          <tr class="border-t border-t-tabel-top-border">
            <td class="h-[72px] px-4 py-2 w-[400px]"><p class="text-2xl font-bold">....</p></td>
            <td class="h-[72px] px-4 py-2 w-[400px]"><p class="text-2xl font-bold">....</p></td>
            <td class="h-[72px] px-4 py-2 w-[400px]"><p class="text-2xl font-bold">....</p></td>
            <td class="h-[72px] px-4 py-2 w-[400px]"><p class="text-2xl font-bold">....</p></td>
            <td class="h-[72px] px-4 py-2 w-[400px]"><p class="text-2xl font-bold">....</p></td>
          </tr>
        `;
      // Apply animation to all placeholder <p> elements
      tbody.querySelectorAll("p").forEach(applyAnimation);
    }
    return;
  }

  // Portfolio value
  if (totalValueEl)
    totalValueEl.innerHTML = `$${coinData.total_usd_value.toFixed(2)}`;

  // 24 hr PNL
  if (pnlValueEl) {
    pnlValueEl.innerHTML = `${coinData.pnl.value.toFixed(2)}`;
  }

  // 24hr change
  if (dailychangeEl) {
    const dayChange =
      coinData.pnl["24hr_change"].toFixed(2) < 0 ? "#da0b35" : "#0bda35";
    dailychangeEl.innerHTML = `${coinData.pnl["24hr_change"].toFixed(2)}%`;
    dailychangeEl.style.color = dayChange;
  }

  if (assetTableEl) {
    const tbody = assetTableEl.querySelector("tbody");
    tbody.innerHTML = "";
    const sortedAssets = Object.entries(coinData.assets).sort(
      ([, a], [, b]) => b.usd_value - a.usd_value
    );
    for (const [asset, info] of sortedAssets) {
      if (info.usd_value <= 1) continue;
      const price =
        info.amount > 0 ? (info.usd_value / info.amount).toFixed(2) : 0;
      const changeClass =
        info.price_change_24h < 0 ? "text-change-red" : "text-change-green";
      const row = `<tr class="border-t border-t-tabel-top-border">
          <td class="h-[72px] px-4 py-2 w-[400px]">${asset}<span class="ml-2">(${asset})</span></td>
          <td class="h-[72px] px-4 py-2 w-[400px]">$${price}</td>
          <td class="h-[72px] px-4 py-2 w-[400px]">${info.amount.toFixed(
            8
          )}</td>
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

// Initial fetch and apply animation to all loading states
const elements = [
  document.getElementById("total-value"),
  document.getElementById("pnl-value"),
  document.getElementById("24hr-change"),
];
elements.forEach(applyAnimation);
fetchPortfolio(); // Initial fetch
setInterval(fetchPortfolio, 10000); // Poll every 10 seconds

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
