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
const buyBtn = document.getElementById("ac-buy-btn");

//load the jsn and store its values in the assetlist
fetch("top_500_assets.json")
  .then((res) => res.json())
  .then((data) => {
    assetList = data.assets; // Use "assets" array from the file
  });

////////////////////////////////////////////////////////
//Reuseable functions
function cleanConvertInputValues(inputId) {
  return Number(document.getElementById(inputId).value.replace(/[^0-9.]/g, ""));
}

// Show suggestions as user types.. Only allow letters (remove numbers/symbols)
function setupAssetAutoSuggest(inputId) {
  const input = document.getElementById(inputId);
  const suggestionBox = document.getElementById(`${inputId}-suggestions`);
  let validAssetSelected = false; // track if user selected a valid asset

  input.addEventListener("input", () => {
    input.value = input.value.replace(/[^a-zA-Z]/g, "");
    const value = input.value.trim().toLowerCase();
    validAssetSelected = false; // reset every input

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
      const symbol = e.target.textContent.split(" - ")[0];
      input.value = `$${symbol}`;
      validAssetSelected = true; // mark as valid
      suggestionBox.classList.add("hidden");
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(() => {
      suggestionBox.classList.add("hidden");

      // show alert and clear if not valid
      if (!validAssetSelected) {
        alert("Please select a valid asset from the list.");
        input.value = "";
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

  if (!enhancedValidation("buy-asset-amount", "buy-asset-price")) return;

  //asset quantity calculation
  const assetQuantity = BuyAssetAmount / BuyAssetPrice;
  const assetQuantityEL = document.getElementById("buy-receive");
  cleanCalc(assetQuantity, assetQuantityEL, assetName);

  //showing the elements in the calssmorphsim container
  const assetNameEl = document.getElementById("buy-name");
  assetNameEl.textContent = assetName;

  document.getElementById("buy-price").textContent = "$" + BuyAssetPrice;
  document.getElementById("buy-price-el").textContent = "$" + BuyAssetAmount;
  document.getElementById("buy-amount").textContent = assetName;
  // document.getElementById(
  //   "buy-receive"
  // ).textContent = `${assetQuantity} ${assetName.slice(1)}`;
}

formatInputsToDollar("buy-asset-amount", "buy-asset-price");

buyBtn.addEventListener("click", () => calculateBuyAsset());
