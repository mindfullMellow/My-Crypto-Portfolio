"use strict";

import "./main.css";

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

console.log("this works");

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
  switchTab("tab-asset-quantity")
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
// Modified: Use tab-specific glassmorphism containers
const glassmorphismLong = document.querySelector(".long-glassmorphism");
const glassmorphismShort = document.querySelector(".short-glassmorphism");

// Reuseable functions
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

/////////////////////////////////////////
/////logic for the long trade calculation
/////////////////////////////////////////
function calcLongTrade() {
  // Clean and convert input values
  const capital = Number(
    document.getElementById("capital").value.replace(/[^0-9.]/g, "")
  );
  const entryPrice = Number(
    document.getElementById("entry-price").value.replace(/[^0-9.]/g, "")
  );
  const tpPrice = Number(
    document.getElementById("tp-price").value.replace(/[^0-9.]/g, "")
  );
  const leverage = Number(
    document.getElementById("leverage").value.replace(/[^0-9.]/g, "")
  );

  // Modified: Enhanced validation to prevent multiple decimals and invalid inputs
  const inputs = ["entry-price", "tp-price", "leverage", "capital"];
  let allFilled = true;
  inputs.forEach((id) => {
    const input = document.getElementById(id);
    const value = input.value.trim().replace(/[^0-9.]/g, "");
    // Check for valid number, positive value, and single decimal point
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

  if (!allFilled) return;

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
  PNLpercentEL.textContent =
    PNLpercent.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "%";
  PNLpercentEL.style.color = PNLpercent < 0 ? "red" : "#b4ff59";

  // Total Return $
  const totalReturn = capital * (1 + PNLpercent / 100);
  const totalReturnEL = document.getElementById("long-return");
  totalReturnEL.textContent =
    "$" +
    totalReturn.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  totalReturnEL.style.color = totalReturn <= 0 ? "red" : "#b4ff59";

  //Net Profit Value $
  const netProfit = totalReturn - capital;
  const npEL = document.getElementById("long-NP");
  npEL.textContent =
    "$" +
    netProfit.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  npEL.style.color = netProfit <= 0 ? "red" : "#b4ff59";
}

// Modified: Updated showResultBox to handle tab-specific containers
function showResultBox(tab) {
  const glassmorphism = tab === "long" ? glassmorphismLong : glassmorphismShort;
  if (glassmorphism.classList.contains("hidden")) {
    glassmorphism.classList.remove("hidden");
    glassmorphism.classList.add("flex");
  }
}
// calling the function
calcLong.addEventListener("click", () => calcLongTrade());

// Format $ inputs
["entry-price", "tp-price", "capital"].forEach((id) => {
  const input = document.getElementById(id);

  input.addEventListener("blur", () => {
    let val = input.value.trim().replace(/[^0-9.]/g, "");
    // Modified: Validate for single decimal and positive number
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
          maximumFractionDigits: 2,
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

// Format leverage input with 'x'
const leverageInput = document.getElementById("leverage");

leverageInput.addEventListener("blur", () => {
  let val = leverageInput.value.trim().replace(/[^0-9.]/g, "");
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
    leverageInput.value = formatted;
  } else {
    leverageInput.value = "";
    leverageInput.style.border = "2px solid red";
  }
});

leverageInput.addEventListener("focus", () => {
  let val = leverageInput.value.trim();
  if (val.endsWith("x")) {
    leverageInput.value = val.replace(/[^0-9.]/g, "");
  }
});

//////////////////////////////////////////
/////logic for the short trade calculation
//////////////////////////////////////////
function calcShortTrade() {
  // Clean and convert input values
  const capital = Number(
    document.getElementById("capital-sh").value.replace(/[^0-9.]/g, "")
  );
  const entryPrice = Number(
    document.getElementById("entry-price-sh").value.replace(/[^0-9.]/g, "")
  );
  const tpPrice = Number(
    document.getElementById("tp-price-sh").value.replace(/[^0-9.]/g, "")
  );
  const leverage = Number(
    document.getElementById("leverage-sh").value.replace(/[^0-9.]/g, "")
  );

  // Enhanced validation to prevent multiple decimals and invalid inputs
  const inputs = ["entry-price-sh", "tp-price-sh", "leverage-sh", "capital-sh"];
  let allFilled = true;
  inputs.forEach((id) => {
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

  if (!allFilled) return;

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
  shortPNLel.textContent =
    shortPNL.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "%";
  shortPNLel.style.color = shortPNL < 0 ? "red" : "#b4ff59";

  // Total Return $
  const shTotalReturn = capital * (1 + shortPNL / 100);
  const shTotalReturnEl = document.getElementById("short-return");
  shTotalReturnEl.textContent =
    "$" +
    shTotalReturn.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  shTotalReturnEl.style.color = shTotalReturn <= 0 ? "red" : "#b4ff59";

  //Net Profit $
  const shNetProfit = shTotalReturn - capital;
  const shNetProfitEl = document.getElementById("short-NP");
  shNetProfitEl.textContent =
    "$" +
    shNetProfit.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  shNetProfitEl.style.color = shNetProfit <= 0 ? "red" : "#b4ff59";
}

// Attach button click
calcShort.addEventListener("click", () => calcShortTrade());

// Format $ inputs
["entry-price-sh", "tp-price-sh", "capital-sh"].forEach((id) => {
  const input = document.getElementById(id);

  input.addEventListener("blur", () => {
    let val = input.value.trim().replace(/[^0-9.]/g, "");
    // Modified: Validate for single decimal and positive number
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
          maximumFractionDigits: 2,
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

// Format leverage input with 'x'
const shortLeverageInput = document.getElementById("leverage-sh");

shortLeverageInput.addEventListener("blur", () => {
  let val = shortLeverageInput.value.trim().replace(/[^0-9.]/g, "");
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
    shortLeverageInput.value = formatted;
  } else {
    shortLeverageInput.value = "";
    shortLeverageInput.style.border = "2px solid red";
  }
});

shortLeverageInput.addEventListener("focus", () => {
  let val = shortLeverageInput.value.trim();
  if (val.endsWith("x")) {
    shortLeverageInput.value = val.replace(/[^0-9.]/g, "");
  }
});

////////////////////////////////////////////////////////////////////////////
// PERCENTAGE CALCULATOR LOGIC
////////////////////////////////////////////////////////////////////////////
// Global variiables for percentge caculation
const calcByPriceBtn = document.getElementById("by-price-btn");
const calcByMarketCapBtn = document.getElementById("by-market-cap-btn");

//Morphsim cotainer vairaibles
const glassmorphismByPrice = document.querySelector(".byprice-glassmorphism");
const glassmorphismByMC = document.querySelector(".bymc-glassmorphism");

//////////////////
// Reuseable functions
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

// Function to show the right result box based on the tab clicked
function showRightTab(tab) {
  const glassmorphism =
    tab === "by-price" ? glassmorphismByPrice : glassmorphismByMC;

  // If it's hidden, show it by removing "hidden" class and adding "flex"
  if (glassmorphism.classList.contains("hidden")) {
    glassmorphism.classList.remove("hidden");
    glassmorphism.classList.add("flex");
  }
}

// function to convert b to billion eetc
function normalizeInput(value) {
  value = value.toLowerCase().trim().replace(/,/g, ""); // remove commas

  const match = value.match(/^([\d.]+)([kmbh])?$/);
  if (!match) return NaN;

  const number = parseFloat(match[1]);
  const suffix = match[2];

  if (suffix === "b") return number * 1_000_000_000;
  if (suffix === "m") return number * 1_000_000;
  if (suffix === "k") return number * 1_000;
  if (suffix === "h") return number * 100;

  return number;
}

/////////////////////////////////////////////////////////////
// Selective calculator tab switching function (percentage calculator (pc))
window.switchPercentageCalculator = function (PcId) {
  //hide all pc content divs
  document.querySelectorAll(".pc-content").forEach((pc) => {
    pc.classList.add("hidden");
  });

  //Remove active styles from all pc-btn buttons
  document.querySelectorAll(".pc-btn").forEach((pcbtn) => {
    pcbtn.classList.replace("text-white", "text-text-color-1");
    pcbtn.classList.replace("border-opacity-100", "border-opacity-0");
  });

  //show the selected tab
  document.getElementById(PcId).classList.replace("hidden", "flex");

  //Activate the selected button
  const targetPc = document.querySelector(`[data-tab="${PcId}"]`);
  targetPc.classList.replace("text-text-color-1", "text-white");
  targetPc.classList.replace("border-opacity-0", "border-opacity-100");
};

// initialize the default tab on page load
// initialize the default tab on page load
window.addEventListener("DOMContentLoaded", () => {
  window.switchAssetQuantityCalculator("by-price");
});

//////////////////////////////////////////
/////logic for the BY PRICE calcultion
//////////////////////////////////////////
function calcByPrice() {
  // clean and convert input values
  const capital = cleanConvertInputValues("by-price-capital");
  const entryPrice = cleanConvertInputValues("by-price-entry");
  const exitPrice = cleanConvertInputValues("by-price-exit");
  const errMessage = document.getElementById("by-price-err");

  if (
    !enhancedValidation("by-price-capital", "by-price-entry", "by-price-exit")
  )
    return;

  //Roi calculation
  const returnOfIndex = ((exitPrice - entryPrice) / entryPrice) * 100;
  const returnOfIndexEl = document.getElementById("by-price-roi");
  cleanCalc(returnOfIndex, returnOfIndexEl, false);

  //Total return
  const totalReturn = capital * (1 + returnOfIndex / 100);
  const totalReturnEL = document.getElementById("by-price-total-return");
  cleanCalc(totalReturn, totalReturnEL, true);

  //Net Profit
  const netProfit = totalReturn - capital;
  const npEL = document.getElementById("by-price-NP");
  cleanCalc(netProfit, npEL, true);

  //show err message if total retun is =< zero
  if (totalReturn <= 0) {
    // hide glassmorphsim if visible
    glassmorphismByPrice.classList.add("hidden");
    glassmorphismByPrice.classList.remove("flex");
    openErrEl(errMessage);
  } else {
    showRightTab("by-price");
  }

  setTimeout(() => {
    closeErrEl(errMessage);
  }, 4000);
}

//calling the logic function
calcByPriceBtn.addEventListener("click", () => calcByPrice());

//call the function to format inout on blur
formatInputsToDollar("by-price-capital", "by-price-entry", "by-price-exit");

//////////////////////////////////////////
/////logic for the BY MARKET CAP calcultion
//////////////////////////////////////////
const mcInputs = [
  document.getElementById("by-market-cap-capital"),
  document.getElementById("by-market-cap-entry"),
  document.getElementById("by-market-cap-exit"),
];
const errMessage = document.getElementById("by-mc-err");

// add blur event once when page loads
mcInputs.forEach((input) => {
  input.addEventListener("blur", () => {
    const num = normalizeInput(input.value);
    if (!isNaN(num)) {
      input.value = num.toLocaleString("en-US");
    }
  });
});

function calcByMarketCap() {
  const [mcCapital, mcEntry, mcExit] = mcInputs;

  // validate
  if (
    !enhancedValidation(
      "by-market-cap-capital",
      "by-market-cap-entry",
      "by-market-cap-exit"
    )
  )
    return;

  // do the calculation
  const mcCapitalValue = Number(mcCapital.value.replace(/[^0-9.]/g, ""));
  const mcEntryValue = Number(mcEntry.value.replace(/[^0-9.]/g, ""));
  const mcExitValue = Number(mcExit.value.replace(/[^0-9.]/g, ""));

  //ROI calculation
  const returnOfIndex = ((mcExitValue - mcEntryValue) / mcEntryValue) * 100;
  const returnOfIndexEl = document.getElementById("by-mc-roi");
  cleanCalc(returnOfIndex, returnOfIndexEl, false);

  //Total return
  const totalReturn = mcCapitalValue * (1 + returnOfIndex / 100);
  const totalReturnEL = document.getElementById("by-mc-total-return");
  cleanCalc(totalReturn, totalReturnEL, true);

  //Net profit
  const netProfit = totalReturn - mcCapitalValue;
  const npEL = document.getElementById("by-mc-NP");
  cleanCalc(netProfit, npEL, true);

  //show err message if total retun is =< zero
  if (totalReturn <= 0) {
    // hide glassmorphsim if visible
    glassmorphismByPrice.classList.add("hidden");
    glassmorphismByPrice.classList.remove("flex");
    openErrEl(errMessage);
  } else {
    showRightTab("by-market-cap");
  }

  setTimeout(() => {
    closeErrEl(errMessage);
  }, 4000);
}

// calling the logic function
calcByMarketCapBtn.addEventListener("click", () => calcByMarketCap());

//call the function to format inout on blur
formatInputsToDollar(
  "by-market-cap-capital",
  "by-market-cap-entry",
  "by-market-cap-exit"
);

////////////////////////////////////////////////////////////////////////////
// ASSETS QUANTITY CALCULATOR LOGIC
////////////////////////////////////////////////////////////////////////////
// Selective calculator tab switching function (asset quantity calculator (ac))
window.switchAssetQuantityCalculator = function (assetID) {
  //hide all ac content divs
  document.querySelectorAll(".asset-content").forEach((ac) => {
    ac.classList.add("hidden");
  });

  //Remove active styles from all Ac-btn buttons
  document.querySelectorAll(".asset-btn").forEach((acbtn) => {
    acbtn.classList.replace("text-white", "text-text-color-1");
    acbtn.classList.replace("border-opacity-100", "border-opacity-0");
  });

  //show the selected tab
  document.getElementById(assetID).classList.replace("hidden", "flex");

  //Activate the selected button
  const targetAc = document.querySelector(`[data-tab="${assetID}"]`);
  targetAc.classList.replace("text-text-color-1", "text-white");
  targetAc.classList.replace("border-opacity-0", "border-opacity-100");
};

// initialize the default tab on page load
window.addEventListener("DOMContentLoaded", () => {
  window.switchAssetQuantityCalculator("buy-asset");
});
