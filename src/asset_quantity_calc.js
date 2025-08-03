"use strict";

import "./main.css";

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

//GLOBAL VARIBLES
let assetList = [];
let selectedSymbolName = ""; // only store the name
const buyBtn = document.getElementById("ac-buy-btn");
const glassmorphismBuy = document.querySelector(".buy-asset-glassmorphism");
const glassmorphismSell = document.querySelector(".sell-asset-glassmorphism");

//load the jsn and store its values in the assetlist
fetch("top_500_assets.json")
  .then((res) => res.json())
  .then((data) => {
    assetList = data.assets; // Use "assets" array from the file
  });

////////////////////////////////////////////////////////
//Reuseable functions
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

function cleanConvertInputValues(inputId) {
  return Number(document.getElementById(inputId).value.replace(/[^0-9.]/g, ""));
}

// Show suggestions as user types.. Only allow letters (remove numbers/symbols)
function setupAssetAutoSuggest(inputId) {
  const input = document.getElementById(inputId);
  const suggestionBox = document.getElementById(`${inputId}-suggestions`);
  let validAssetSelected = false;
  let errorTimeout = null;

  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^a-zA-Z]/g, "");
    const value = input.value.trim().toLowerCase();
    validAssetSelected = false;

    const matches = assetList
      .filter(
        (asset) =>
          asset.name.toLowerCase().includes(value) ||
          asset.symbol.toLowerCase().includes(value)
      )
      .slice(0, 10);

    if (matches.length === 0 || value === "") {
      suggestionBox.classList.add("hidden");
      suggestionBox.innerHTML = "";
      return;
    }

    suggestionBox.innerHTML = matches
      .map(
        (asset) =>
          `<li class="px-4 py-2 hover:bg-gray-200 cursor-pointer">${asset.symbol} - ${asset.name}</li>`
      )
      .join("");
    suggestionBox.classList.remove("hidden");
  });

  suggestionBox.addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
      const [, name] = e.target.textContent.split(" - ");
      input.value = `$${e.target.textContent.split(" - ")[0]}`;
      selectedSymbolName = name.trim(); // store only the name
      validAssetSelected = true;
      suggestionBox.classList.add("hidden");
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(() => {
      suggestionBox.classList.add("hidden");
      if (!validAssetSelected) {
        const value = input.value
          .trim()
          .toLowerCase()
          .replace(/[^a-zA-Z]/g, "");
        if (value !== "") {
          const isValidAsset = assetList.some(
            (asset) =>
              asset.name.toLowerCase() === value ||
              asset.symbol.toLowerCase() === value
          );
          const errMessageEl = document.getElementById("asset-err");
          if (!isValidAsset && errMessageEl) {
            if (errorTimeout) clearTimeout(errorTimeout); // Clear any existing timeout
            openErrEl(errMessageEl);
            errorTimeout = setTimeout(() => {
              closeErrEl(errMessageEl);
            }, 4000);
          }
        }
        input.value = "";
        selectedSymbolName = "";
      }
      validAssetSelected = false;
    }, 100);
  });
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

//function to clean any calulation
function cleanCalc(mainCalc, calcEl, assetName) {
  calcEl.textContent =
    mainCalc.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }) + ` ${assetName.slice(1)}`;
  calcEl.style.color = mainCalc <= 0 ? "red" : "#b4ff59";
}

// Function to show the right result box based on the tab clicked
//Morphsim cotainer vairaibles
function showRightTab(tab) {
  const glassmorphism =
    tab === "buy-asset" ? glassmorphismBuy : glassmorphismSell;

  // If it's hidden, show it by removing "hidden" class and adding "flex"
  if (glassmorphism.classList.contains("hidden")) {
    glassmorphism.classList.remove("hidden");
    glassmorphism.classList.add("flex");
  }
}

//////////////////////////////////////////////////////////////
// logic for Asset Quantity calcuator (BUY)
//call the suggestion fuction
window.addEventListener("DOMContentLoaded", () => {
  setupAssetAutoSuggest("buy-asset-name");
});

function calculateBuyAsset() {
  const assetName = document.getElementById("buy-asset-name").value;
  const BuyAssetAmount = cleanConvertInputValues("buy-asset-amount");
  const BuyAssetPrice = cleanConvertInputValues("buy-asset-price");
  const assetSymbol = selectedSymbolName;

  if (!enhancedValidation("buy-asset-amount", "buy-asset-price")) return;

  //asset quantity calculation and show the content
  const assetQuantity = BuyAssetAmount / BuyAssetPrice;
  const assetQuantityEL = document.getElementById("buy-receive");
  cleanCalc(assetQuantity, assetQuantityEL, assetName);

  //showing the asset name
  const assetNameEl = document.getElementById("buy-name");
  assetNameEl.textContent = assetSymbol;

  //show the price of the asset
  document.getElementById("buy-price").textContent = "$" + BuyAssetPrice;

  //amount to buy and the symbol of the supoosed asset
  document.getElementById("buy-price-el").textContent = "$" + BuyAssetAmount;
  document.getElementById("buy-amount").textContent = assetName;

  //show the glass morphism tab
  showRightTab("buy-asset");
}

formatInputsToDollar("buy-asset-amount", "buy-asset-price");

buyBtn.addEventListener("click", () => calculateBuyAsset());
