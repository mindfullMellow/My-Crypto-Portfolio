"use strict";

import "./main.css";

fetch("http://127.0.0.1:5000/full-portfolio")
  .then((res) => res.json())
  .then((data) => {
    // Check if spot exists and is array
    if (!Array.isArray(data.spot)) {
      console.error("Spot data missing or not an array", data);
      return;
    }

    // Find SOL inside spot array
    const solAsset = data.spot.find((item) => item.asset === "SOL");
    const solTable = document.querySelector(".sol-quantity");

    if (solAsset && solTable) {
      solTable.textContent = solAsset.total;
      console.log("SOL total:", solAsset.total);
    } else {
      console.log("SOL not found or element missing");
    }
  });
