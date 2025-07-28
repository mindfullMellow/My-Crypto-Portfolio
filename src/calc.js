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
    tab.classList.add("invisible");
    tab.classList.remove("opacity-100");
    tab.classList.add("opacity-0");
  });

  // Reset all tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("opacity-100");
    btn.classList.add("opacity-85");
  });

  // Show selected tab content
  const activeTab = document.getElementById(tabId);
  if (activeTab) {
    activeTab.classList.remove("invisible");
    activeTab.classList.remove("opacity-0");
    activeTab.classList.add("opacity-100");
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
// Selective calculator tab switching function
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
window.onload = () => {
  window.switchCalc("long-trade");
};
