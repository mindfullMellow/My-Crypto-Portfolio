"use strict";
import "./main.css";
// import { applyAnimation } from "./main";
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
// const Newyear = new Date().getFullYear();
// document.getElementById("year").textContent = Newyear;

//////////////////////////////////////////////////////

const addWallet = document.getElementById("add-wallet-btn");
const modalOverlay = document.getElementById("modal-overlay");
const closeBtn = document.querySelectorAll(".modal-close");
const iconEl = document.getElementById("support-icon");
const networks = document.getElementById("networks");
const supportBtn = document.getElementById("support-main-btn");
// Step modal2 vaibales
const addWalletBox = document.getElementById("add-wallet-box");
const modalOverlay2 = document.getElementById("modal-overlay-2");
const return_to_step_1Btn = document.getElementById("return-to-step-1-btn");
const wallet_name_input = document.getElementById("wallet-name");
const wallet_name_counter = document.getElementById("wallet-counter");

// Logic to show the suppoerted networks on the create wallet modal
supportBtn.addEventListener("click", (event) => {
  iconEl.classList.toggle("rotate-180");
  networks.classList.toggle("show");
  event.stopPropagation();
});

//Logic to show step-1 modal
addWallet.addEventListener("click", () => {
  setTimeout(() => {
    modalOverlay.classList.replace("hidden", "flex");
  }, 50);
});

closeBtn.forEach(function (btn) {
  btn.addEventListener("click", () => {
    setTimeout(() => {
      modalOverlay.classList.replace("flex", "hidden");
      modalOverlay2.classList.replace("flex", "hidden");
    }, 50);
  });
});

// Logic to show step-2 modal
addWalletBox.addEventListener("click", () => {
  setTimeout(() => {
    modalOverlay.classList.replace("flex", "hidden");
    modalOverlay2.classList.replace("hidden", "flex");
  }, 50);
});

//Logic to go back to step-1 modal while on step-2 modal
return_to_step_1Btn.addEventListener("click", () => {
  setTimeout(() => {
    modalOverlay.classList.replace("hidden", "flex");
    modalOverlay2.classList.replace("flex", "hidden");
  }, 50);
});

//Counting the cahracters for the wallet the input
wallet_name_input.addEventListener("input", () => {
  let text = wallet_name_input.value;

  if (text.length > 24) {
    wallet_name_input.value = text.slice(0, 24);
    text = wallet_name_input.value;

    // change immediately
    wallet_name_input.classList.replace(
      "focus:ring-hover",
      "focus:ring-change-red"
    );

    // switch back after 2s
    setTimeout(() => {
      wallet_name_input.classList.replace(
        "focus:ring-change-red",
        "focus:ring-hover"
      );
    }, 2000);
  }

  wallet_name_counter.textContent = `${text.length}/24 characters`;
});
