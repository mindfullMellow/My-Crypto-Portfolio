"use strict";

import "./main.css";
import { getLastUpdated } from "./ApiLogic.js";

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

// Close modal when Escape key is pressed
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !overlayEL.classList.contains("hidden")) {
    overlayEL.classList.add("hidden");
    zIndex.classList.add("z-50");
    for (let i = 0; i < profileModal.length; i++) {
      profileModal[i].classList.replace("flex", "hidden");
    }
  }
});

/////////////////////////////////////////////////
// code to get current year
const Newyear = new Date().getFullYear();
document.getElementById("year").textContent = Newyear;

/////////////////////////////////////////////////
// code to get the last updated time
const lastUpdated = new Date(getLastUpdated()).toLocaleString();
const [date, time, suffix] = lastUpdated.split(" ");
const output = `${date.replace(",", "")} at ${time} ${suffix}`;
document.getElementById("last-updated").textContent = output;

///////////////////////////////////////////////////
//seletive calculator tab switching function
function switchTab(tabId) {
  // Hide all tab contents
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.add("hidden");
  });

  // Reset all tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("opacity-100");
    btn.classList.add("opacity-85");
  });

  // Show selected tab content
  const activeTab = document.getElementById(tabId);
  if (activeTab) {
    activeTab.classList.remove("hidden");
  }

  // Activate selected tab button and position sliding border
  const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
  if (activeBtn) {
    activeBtn.classList.add("opacity-100");
    activeBtn.classList.remove("opacity-85");

    const slidingBorder =
      activeBtn.parentElement.parentElement.querySelector(".sliding-border");
    if (slidingBorder) {
      const rect = activeBtn.getBoundingClientRect();
      const containerRect =
        activeBtn.parentElement.parentElement.getBoundingClientRect();
      slidingBorder.style.left = `${rect.left - containerRect.left}px`;
      slidingBorder.style.width = `${rect.width}px`;
    }
  }
}

// Attach event listeners to tab buttons
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tabId = btn.getAttribute("data-tab");
    switchTab(tabId);
  });
});

// Set default active tab on page load
document.addEventListener("DOMContentLoaded", () =>
  switchTab("tab-risk-reward")
);

//////////////////////////////////////////////////////
// Selective calculator tab switching function (risk - reward calculator)
// in this code scope ihad to attch the function to the windows object sincce i am using the inline html handler (onclick) this put the functiononthe global scope so if i instead used addeventListener iwouldnt need to attach the window object to the function ..thats why this function is the most unique function in THIS PROJECT 😂😂
window.switchCalc = function (calcId) {
  // Hide all calc-content divs
  document.querySelectorAll(".calc-content").forEach((calc) => {
    calc.classList.add("hidden");
  });

  // Remove active styles from all rr-btn buttons
  document.querySelectorAll(".rr-btn").forEach((rr) => {
    rr.classList.replace("text-white", "text-text-color-1");
    rr.classList.replace("border-opacity-100", "border-opacity-0");
  });

  // Show the selected tab
  document.getElementById(calcId).classList.replace("hidden", "flex");

  // Activate the selected button
  const targetButton = document.querySelector(`[data-tab="${calcId}"]`);
  targetButton.classList.replace("text-text-color-1", "text-white");
  targetButton.classList.replace("border-opacity-0", "border-opacity-100");
};

// Initialize the default tab on page load
window.addEventListener("DOMContentLoaded", () => {
  window.switchCalc("long-trade");
});

//////////////////////////////////////////////////////////////
// logic for crypto-risk-reward calculator (LONG-TRADE)
const calcLong = document.getElementById("long-btn-calc");
const calcShort = document.getElementById("short-btn-calc");
const glassmorphismLong = document.querySelector(".long-glassmorphism");
const glassmorphismShort = document.querySelector(".short-glassmorphism");

// ////////////////////////////////Reuseable functions
//function to show error message
function openErrEl(errMessageEl) {
  errMessageEl.classList.replace("opacity-0", "opacity-100");
  errMessageEl.classList.replace("invisible", "visible");
  errMessageEl.classList.replace("pointer-events-none", "pointer-events-auto");
}

//function to remove error message
function closeErrEl(errMessageEl) {
  errMessageEl.classList.replace("opacity-100", "opacity-0");
  errMessageEl.classList.replace("visible", "invisible");
  errMessageEl.classList.replace("pointer-events-auto", "pointer-events-none");
}

//function to getclean inputs
function cleanConvertInputValues(inputId) {
  return Number(document.getElementById(inputId).value.replace(/[^0-9.]/g, ""));
}

// function to Enhanced validation to prevent multiple decimals and invalid inputs
function enhancedValidation(...ids) {
  let allFilled = true;
  ids.forEach((id) => {
    const input = document.getElementById(id);
    const value = input.value.trim().replace(/[^0-9.]/g, "");
    if (
      !value ||
      isNaN(value) ||
      value <= 0 ||
      (value.match(/\./g) || []).length > 1
    ) {
      input.style.border = "2px solid red";
      allFilled = false;
    } else {
      input.style.border = "";
    }
  });
  return allFilled; // ✅ important
}

//function to clean any calulation
function cleanCalc(mainCalc, calcEl, sign = false) {
  // decide what sign to show
  let prefix = "";
  let suffix = "";

  if (sign) {
    prefix = "$";
  } else if (!sign) {
    suffix = "%";
  }

  calcEl.textContent =
    prefix +
    mainCalc.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) +
    suffix;
  calcEl.style.color = mainCalc <= 0 ? "red" : "#b4ff59";
}

//function to switch tabs
function showResultBox(tab) {
  const glassmorphism = tab === "long" ? glassmorphismLong : glassmorphismShort;
  if (glassmorphism.classList.contains("hidden")) {
    glassmorphism.classList.remove("hidden");
    glassmorphism.classList.add("flex");
  }
}

// function to format $ inputs
function formatInputsToDollar(...ids) {
  ids.forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener("blur", () => {
      let val = input.value.trim().replace(/[^0-9.]/g, "");
      if (
        val &&
        !isNaN(val) &&
        Number(val) > 0 &&
        (val.match(/\./g) || []).length <= 1
      ) {
        const formatted =
          "$" +
          Number(val).toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 4,
          });
        input.value = formatted;
      } else {
        input.value = "";
        input.style.border = "2px solid red";
      }
    });

    input.addEventListener("focus", () => {
      let val = input.value.trim();
      if (val.startsWith("$")) {
        input.value = val.replace(/[^0-9.]/g, "");
      }
    });
  });
}

//// Format leverage input with 'x'
function formatInputToLeverage(xinput) {
  xinput.addEventListener("blur", () => {
    let val = xinput.value.trim().replace(/[^0-9.]/g, "");
    // Modified: Validate for single decimal and positive number
    if (
      val &&
      !isNaN(val) &&
      Number(val) > 0 &&
      (val.match(/\./g) || []).length <= 1
    ) {
      const formatted =
        Number(val).toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }) + "x";
      xinput.value = formatted;
    } else {
      xinput.value = "";
      xinput.style.border = "2px solid red";
    }
  });

  xinput.addEventListener("focus", () => {
    let val = xinput.value.trim();
    if (val.endsWith("x")) {
      xinput.value = val.replace(/[^0-9.]/g, "");
    }
  });
}

/////////////////////////////////////////
/////logic for the long trade calculation
/////////////////////////////////////////
function calcLongTrade() {
  // Clean and convert input values
  const capital = cleanConvertInputValues("capital");
  const entryPrice = cleanConvertInputValues("entry-price");

  const tpPrice = cleanConvertInputValues("tp-price");
  const leverage = cleanConvertInputValues("leverage");

  // Modified: Enhanced validation to prevent multiple decimals and invalid inputs
  if (!enhancedValidation("entry-price", "tp-price", "leverage", "capital"))
    return;

  // Liquidation price
  const longLP = entryPrice * (1 - 1 / leverage);
  const formattedLP = longLP.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  //show error message if TP < LP
  const errmessage = document.getElementById("long-err");

  if (tpPrice < longLP) {
    // hide glassmorphsim if visible
    glassmorphismLong.classList.add("hidden");
    glassmorphismLong.classList.remove("flex");
    //show the error message
    document.getElementById("err-no").textContent = `${formattedLP}`;
    openErrEl(errmessage);
  } else {
    // show glassmorphsim if all condition is met
    showResultBox("long");
  }
  //Hide after 3 seconds
  setTimeout(() => {
    closeErrEl(errmessage);
  }, 4000);

  //display liquidation price in the lp container
  document.getElementById("long-lp").textContent = "$" + formattedLP;

  // Risk to Reward
  const risk = entryPrice - longLP;
  const reward = tpPrice - entryPrice;
  const RRR = risk !== 0 ? reward / risk : 0;

  const rrElem = document.getElementById("long-rr");
  rrElem.textContent =
    "1:" +
    RRR.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  rrElem.style.color = RRR < 0 ? "red" : "#b4ff59";

  // PNL Percent %
  const PNLpercent = ((tpPrice - entryPrice) / entryPrice) * 100 * leverage;
  const PNLpercentEL = document.getElementById("long-pnl");
  cleanCalc(PNLpercent, PNLpercentEL, false);

  // Total Return $
  const totalReturn = capital * (1 + PNLpercent / 100);
  const totalReturnEL = document.getElementById("long-return");
  cleanCalc(totalReturn, totalReturnEL, true);

  //Net Profit Value $
  const netProfit = totalReturn - capital;
  const npEL = document.getElementById("long-NP");
  cleanCalc(netProfit, npEL, true);
}

// calling the function
calcLong.addEventListener("click", () => calcLongTrade());

// Format $ inputs on blur
formatInputsToDollar("entry-price", "tp-price", "capital");

// Format leverage input with 'x'
formatInputToLeverage(document.getElementById("leverage"));

//////////////////////////////////////////
/////logic for the short trade calculation
//////////////////////////////////////////
function calcShortTrade() {
  // Clean and convert input values
  const capital = cleanConvertInputValues("capital-sh");
  const entryPrice = cleanConvertInputValues("entry-price-sh");
  const tpPrice = cleanConvertInputValues("tp-price-sh");
  const leverage = cleanConvertInputValues("leverage-sh");

  // Enhanced validation to prevent multiple decimals and invalid inputs
  if (
    !enhancedValidation(
      "entry-price-sh",
      "tp-price-sh",
      "leverage-sh",
      "capital-sh"
    )
  )
    return;

  // Liquidation price calculation
  const shortLP = entryPrice * (1 + 1 / leverage);
  const formattedShortLp = shortLP.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const shErrMessage = document.getElementById("short-err");

  //show err message if tp > liquidation price
  if (tpPrice > shortLP) {
    // hide glassmorphsim if visible
    glassmorphismLong.classList.add("hidden");
    glassmorphismLong.classList.remove("flex");
    //show the error message
    document.getElementById(
      "short-err-no"
    ).textContent = `$${formattedShortLp}`;
    openErrEl(shErrMessage);
  } else {
    // show glassmorphsim if all condition is met
    showResultBox("short");
  }

  //Hide after 3 seconds
  setTimeout(() => {
    closeErrEl(shErrMessage);
  }, 4000);

  //display liquidation price in the glassmorphism
  document.getElementById("short-lp").textContent = "$" + formattedShortLp;

  // Risk Reward calculation
  const risk = shortLP - entryPrice; // Risk = Liquidation - Entry
  const reward = entryPrice - tpPrice; // Reward = Entry - TP
  const RRR = risk !== 0 ? reward / risk : 0;
  const rrElem = document.getElementById("short-rr");
  rrElem.textContent =
    "1:" +
    Math.abs(RRR).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  rrElem.style.color = RRR < 0 ? "red" : "#b4ff59";

  // short PNL calculation
  const shortPNL = ((entryPrice - tpPrice) / entryPrice) * 100 * leverage;
  const shortPNLel = document.getElementById("short-pnl");
  cleanCalc(shortPNL, shortPNLel, false);

  // Total Return $
  const shTotalReturn = capital * (1 + shortPNL / 100);
  const shTotalReturnEl = document.getElementById("short-return");
  cleanCalc(shTotalReturn, shTotalReturnEl, true);

  //Net Profit $
  const shNetProfit = shTotalReturn - capital;
  const shNetProfitEl = document.getElementById("short-NP");
  cleanCalc(shNetProfit, shNetProfitEl, true);
}

// Attach button click
calcShort.addEventListener("click", () => calcShortTrade());

// Format $ inputs
formatInputsToDollar("entry-price-sh", "tp-price-sh", "capital-sh");

// Format leverage input with 'x'
formatInputToLeverage(document.getElementById("leverage-sh"));
