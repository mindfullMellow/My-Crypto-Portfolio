"use strict";
import "./main.css";
import UniversalLoader from "./extras/universal_loader";

///////////////////////////////////////////////////////////////////////
// show loader right away
UniversalLoader.show("Loading page...");

// fake loadData function for demo (2s delay)
async function loadData() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

async function init() {
  try {
    ///////////////////////////////////////////////////////////////////////
    // MOBILE NAV LOGIC
    const buttonEL = document.querySelector(".btn-mobile-nav");
    const headerEl = document.querySelector(".header-sm");
    const mainNavEL = document.querySelector(".main-nav");

    buttonEL.addEventListener("click", function () {
      headerEl.classList.toggle("nav-open");
    });

    const obsMainNav = new IntersectionObserver(
      function (entries) {
        const ent = entries[0];
        if (
          ent.isIntersecting === false &&
          headerEl.classList.contains("nav-open")
        ) {
          headerEl.classList.remove("nav-open");
        }
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "-80px",
      }
    );
    obsMainNav.observe(mainNavEL);

    ///////////////////////////////////////////////////////////////////////
    // MODAL logic
    const overlayEL = document.querySelector(".overlay");
    const zIndex = document.querySelector(".btn-mobile-nav");
    const profileBtn = document.querySelectorAll(".profile-btn");
    const profileModal = document.querySelectorAll(".profile-modal");

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

    for (let i = 0; i < profileBtn.length; i++) {
      profileBtn[i].addEventListener("click", openProfileModal);
    }

    overlayEL.addEventListener("click", closeProfileModal);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlayEL.classList.contains("hidden")) {
        overlayEL.classList.add("hidden");
        zIndex.classList.add("z-50");
        for (let i = 0; i < profileModal.length; i++) {
          profileModal[i].classList.replace("flex", "hidden");
        }
      }
    });

    ///////////////////////////////////////////////////////////////////////
    // WALLET MODALS
    const addWallet = document.querySelectorAll(".add-wallet-btn");
    const modalOverlay = document.getElementById("modal-overlay");
    const closeBtn = document.querySelectorAll(".modal-close");
    const iconEl = document.getElementById("support-icon");
    const networks = document.getElementById("networks");
    const supportBtn = document.getElementById("support-main-btn");
    const addWalletBox = document.getElementById("add-wallet-box");
    const modalOverlay2 = document.getElementById("modal-overlay-2");
    const return_to_step_1Btn = document.getElementById("return-to-step-1-btn");
    const wallet_name_input = document.getElementById("wallet-name");
    const wallet_name_counter = document.getElementById("wallet-counter");

    supportBtn.addEventListener("click", (event) => {
      iconEl.classList.toggle("rotate-180");
      networks.classList.toggle("show");
      event.stopPropagation();
    });

    addWallet.forEach((btn) => {
      btn.addEventListener("click", () => {
        setTimeout(() => {
          modalOverlay.classList.replace("hidden", "flex");
        }, 50);
      });
    });

    closeBtn.forEach(function (btn) {
      btn.addEventListener("click", () => {
        setTimeout(() => {
          modalOverlay.classList.replace("flex", "hidden");
          modalOverlay2.classList.replace("flex", "hidden");
        }, 50);
      });
    });

    addWalletBox.addEventListener("click", () => {
      setTimeout(() => {
        modalOverlay.classList.replace("flex", "hidden");
        modalOverlay2.classList.replace("hidden", "flex");
      }, 50);
    });

    return_to_step_1Btn.addEventListener("click", () => {
      setTimeout(() => {
        modalOverlay.classList.replace("hidden", "flex");
        modalOverlay2.classList.replace("flex", "hidden");
      }, 50);
    });

    wallet_name_input.addEventListener("input", () => {
      let text = wallet_name_input.value;

      if (text.length > 24) {
        wallet_name_input.value = text.slice(0, 24);
        text = wallet_name_input.value;
        wallet_name_input.classList.replace(
          "focus:ring-hover",
          "focus:ring-change-red"
        );
        setTimeout(() => {
          wallet_name_input.classList.replace(
            "focus:ring-change-red",
            "focus:ring-hover"
          );
        }, 2000);
      }

      wallet_name_counter.textContent = `${text.length}/24 characters`;
    });

    ///////////////////////////////////////////////////////////////////////
    // fake data loading + UI setup
    await loadData();
    setupUI();
  } finally {
    UniversalLoader.hide(); // Always hide
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
