"use strict";

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
  window.switchAssetQuantityCalculator("sell-asset");
});

//GLOBAL VARIBLES
let assetList = [];
let selectedSymbolName = ""; // only store the name
const buyBtn = document.getElementById("ac-buy-btn");
const sellBtn = document.getElementById("ac-sell-btn");
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
let buySelectedSymbolName = "";
let sellSelectedSymbolName = "";
let buyAssetDetails = {};
let sellAssetDetails = {};

// Show suggestions as user types. Only allow letters (remove numbers/symbols)
function setupAssetAutoSuggest(inputId, priceInputId) {
  const input = document.getElementById(inputId);
  const suggestionBox = document.getElementById(`${inputId}-suggestions`);
  const errMessageEl = document.getElementById(`${inputId}-err`);
  let validAssetSelected = false;
  let errorTimeout = null;

  // Check if elements exist
  if (!input) {
    console.error(`Input element with ID "${inputId}" not found.`);
    return;
  }
  if (!suggestionBox) {
    console.error(`Suggestion box with ID "${inputId}-suggestions" not found.`);
    return;
  }
  if (!assetList) {
    console.error(`assetList is not defined for "${inputId}".`);
    return;
  }

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

  suggestionBox.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "LI") {
      const [symbol, name] = e.target.textContent.split(" - ");
      input.value = `$${symbol}`;

      const selectedAsset = assetList.find(
        (asset) =>
          asset.name.toLowerCase() === name.trim().toLowerCase() &&
          asset.symbol.toLowerCase() === symbol.trim().toLowerCase()
      );

      if (inputId === "buy-asset-name") {
        buySelectedSymbolName = name.trim();

        // ✅ Save buy asset details
        buyAssetDetails = {
          price: selectedAsset.price,
          market_cap: selectedAsset.market_cap,
          change_24h: selectedAsset.change_24h,
          image: selectedAsset.image,
        };

        // ✅ Auto-fill price and trigger blur so $ gets added
        const priceInput = document.getElementById(priceInputId);
        priceInput.value = selectedAsset.price;
        priceInput.dispatchEvent(new Event("blur")); // ✅ trigger formatting logic
      } else if (inputId === "sell-asset-name") {
        sellSelectedSymbolName = name.trim();

        // ✅ Save sell asset details
        sellAssetDetails = {
          price: selectedAsset.price,
          market_cap: selectedAsset.market_cap,
          change_24h: selectedAsset.change_24h,
          image: selectedAsset.image,
        };

        // ✅ Auto-fill price and trigger blur for sell (if needed)
        const priceInput = document.getElementById(priceInputId);
        priceInput.value = selectedAsset.price;
        priceInput.dispatchEvent(new Event("blur")); // ✅ trigger formatting
      }

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
          if (!isValidAsset && errMessageEl) {
            if (errorTimeout) clearTimeout(errorTimeout);
            openErrEl(errMessageEl);
            errorTimeout = setTimeout(() => {
              closeErrEl(errMessageEl);
            }, 4000);
          }
        }
        input.value = "";
        if (inputId === "buy-asset-name") {
          buySelectedSymbolName = "";
        } else if (inputId === "sell-asset-name") {
          sellSelectedSymbolName = "";
        }
      }
      validAssetSelected = false;
    }, 200);
  });
}

// Initialize both inputs on DOMContentLoaded
window.addEventListener("DOMContentLoaded", () => {
  setupAssetAutoSuggest("buy-asset-name", "buy-asset-price");
  setupAssetAutoSuggest("sell-asset-name", "sell-asset-price");
});

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
  console.log("Checking input:", id, input);
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
      maximumFractionDigits: 6,
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

function calculateBuyAsset() {
  const assetName = document.getElementById("buy-asset-name").value;
  const BuyAssetAmount = cleanConvertInputValues("buy-asset-amount");
  const BuyAssetPrice = cleanConvertInputValues("buy-asset-price");

  const assetSymbol = buySelectedSymbolName || assetName;

  // Validate the necessery inputs
  if (!enhancedValidation("buy-asset-amount", "buy-asset-price")) return;

  //////////////////////////////
  if (!assetName.trim()) {
    buyAssetDetails = {};
  }

  if (buyAssetDetails.image) {
    //show the asset img
    document.getElementById("buy-asset-img").src = buyAssetDetails.image;
    document.getElementById("buy-asset-sub-div1").classList.remove("hidden");
    document.getElementById("buy-asset-sub-div2").classList.remove("hidden");
    document.getElementById("buy-asset-sub-div3").classList.remove("hidden");
    document
      .getElementById("buy-asset-sub-div4")
      .classList.replace("block", "hidden");
  } else {
    document.getElementById("buy-asset-sub-div1").classList.add("hidden");
    document.getElementById("buy-asset-sub-div2").classList.add("hidden");
    document.getElementById("buy-asset-sub-div3").classList.add("hidden");
    document
      .getElementById("buy-asset-sub-div4")
      .classList.replace("hidden", "block");
  }

  /*//////show 24hr change////////////*/
  //  added this fallback if user didn't pick an asset
  const BuyChange = buyAssetDetails.change_24h
    ? buyAssetDetails.change_24h.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "%"
    : "0.00%";

  const buyChangeColor =
    Number(buyAssetDetails.change_24h) < 0 ? "red" : "#b4ff59";
  document.getElementById("buy-change").textContent = BuyChange;
  document.getElementById("buy-change").style.color = buyChangeColor;

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
  document.getElementById("buy-price-el2").textContent = "$" + BuyAssetAmount;
  document.getElementById("buy-amount").textContent = assetName;

  //show the glass morphism tab
  showRightTab("buy-asset");
}

formatInputsToDollar("buy-asset-amount", "buy-asset-price");

buyBtn.addEventListener("click", () => calculateBuyAsset());

//////////////////////////////////////////////////////////////
//logic for asset Quantity calulator (SELL)

function calculateSellAsset() {
  const assetName = document.getElementById("sell-asset-name").value;
  const SellAssetAmount = cleanConvertInputValues("sell-asset-amount");
  const SellAssetPrice = cleanConvertInputValues("sell-asset-price");

  const assetSymbol = sellSelectedSymbolName || assetName;

  // Validate the necessery inputs
  if (!enhancedValidation("sell-asset-amount", "sell-asset-price")) return;

  // 👇 Reset asset details if input is empty
  if (!assetName.trim()) {
    sellAssetDetails = {};
  }

  //show asset image
  if (sellAssetDetails.image) {
    document.getElementById("sell-asset-img").src = sellAssetDetails.image;
    document.getElementById("sell-asset-sub-div1").classList.remove("hidden");
    document.getElementById("sell-asset-sub-div2").classList.remove("hidden");
  } else {
    document.getElementById("sell-asset-sub-div1").classList.add("hidden");
    document.getElementById("sell-asset-sub-div2").classList.add("hidden");
  }

  /*//////show 24hr change////////////*/
  // added fallback like in buy to avoid crash
  const SellChange = sellAssetDetails.change_24h
    ? sellAssetDetails.change_24h.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "%"
    : "0.00%";

  const sellChangeColor =
    Number(sellAssetDetails.change_24h) < 0 ? "red" : "#b4ff59";
  document.getElementById("sell-change").textContent = SellChange;
  document.getElementById("sell-change").style.color = sellChangeColor;

  //show asset name
  document.getElementById("sell-name").textContent = assetSymbol;

  //show asset price
  document.getElementById("sell-price").textContent = "$" + SellAssetPrice;

  // ✅ updated: use assetSymbol directly instead of assetName.slice(1)
  document.getElementById(
    "sell-amount"
  ).textContent = `${SellAssetAmount} ${assetSymbol}`;

  const totalReturn = SellAssetPrice * SellAssetAmount;
  const totalReturnEL = document.getElementById("sell-receive");
  totalReturnEL.textContent =
    "$" +
    totalReturn.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  showRightTab("sell-asset");
}

formatInputsToDollar("sell-asset-price");

sellBtn.addEventListener("click", () => calculateSellAsset());
