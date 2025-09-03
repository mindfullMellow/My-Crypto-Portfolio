"use strict";

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
window.addEventListener("DOMContentLoaded", () => {
  window.switchPercentageCalculator("by-price");
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

  //  Only validate entry and exit
  if (!enhancedValidation("by-price-entry", "by-price-exit")) return;

  //Roi calculation
  const returnOfIndex = ((exitPrice - entryPrice) / entryPrice) * 100;
  const returnOfIndexEl = document.getElementById("by-price-roi");
  cleanCalc(returnOfIndex, returnOfIndexEl, false);

  const totalReturnEL = document.getElementById("by-price-total-return");
  const npEL = document.getElementById("by-price-NP");

  //  if capital is given, calculate totalReturn and netProfit
  if (!isNaN(capital) && capital > 0) {
    //Total return
    const totalReturn = capital * (1 + returnOfIndex / 100);
    cleanCalc(totalReturn, totalReturnEL, true);

    //Net Profit
    const netProfit = totalReturn - capital;
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
  } else {
    // Show placeholder if capital not entered
    totalReturnEL.textContent = "--";
    npEL.textContent = "--";
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

  // only validate entry and exit
  if (!enhancedValidation("by-market-cap-entry", "by-market-cap-exit")) return;

  // do the calculation
  const mcCapitalValue = Number(mcCapital.value.replace(/[^0-9.]/g, ""));
  const mcEntryValue = Number(mcEntry.value.replace(/[^0-9.]/g, ""));
  const mcExitValue = Number(mcExit.value.replace(/[^0-9.]/g, ""));

  //ROI calculation
  const returnOfIndex = ((mcExitValue - mcEntryValue) / mcEntryValue) * 100;
  const returnOfIndexEl = document.getElementById("by-mc-roi");
  cleanCalc(returnOfIndex, returnOfIndexEl, false);

  const totalReturnEL = document.getElementById("by-mc-total-return");
  const npEL = document.getElementById("by-mc-NP");

  //  Only calculate total and profit if capital is valid
  if (!isNaN(mcCapitalValue) && mcCapitalValue > 0) {
    //Total return
    const totalReturn = mcCapitalValue * (1 + returnOfIndex / 100);
    cleanCalc(totalReturn, totalReturnEL, true);

    //Net profit
    const netProfit = totalReturn - mcCapitalValue;
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
  } else {
    // Show placeholders for missing capital
    totalReturnEL.textContent = "--";
    npEL.textContent = "--";
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
