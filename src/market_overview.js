"use strict";
import "./main.css";

// universal-loader.js - Standalone module file
class UniversalLoader {
  static loader = null;
  static loadingText = null;
  static styleInjected = false;

  static init() {
    // Inject styles if not already done
    if (!this.styleInjected) {
      this.injectStyles();
      this.styleInjected = true;
    }

    this.loader = document.getElementById("universalLoader");
    this.loadingText = document.getElementById("loadingText");

    // Create loader if it doesn't exist
    if (!this.loader) {
      this.createLoader();
    }
  }

  static injectStyles() {
    const styles = `
            .universal-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(26, 26, 26, 0.95);
                backdrop-filter: blur(4px);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
                transition: opacity 0.3s ease-out, visibility 0.3s ease-out;
                opacity: 0;
                visibility: hidden;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .universal-loader.show {
                opacity: 1;
                visibility: visible;
            }

            .loader-content {
                display: flex;
                align-items: center;
                gap: 12px;
                color: white;
                height: 32px;
            }

            .logo-stack {
                position: relative;
                width: 48px;
                height: 48px;
                filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.2));
                animation: stackGlow 2.5s ease-out infinite;
            }

            .brand-section {
                display: flex;
                flex-direction: column;
                justify-content: center;
                height: 32px;
            }

            .coin {
                position: absolute;
                width: 48px;
                height: 48px;
                left: 0;
            }

            .coin svg {
                width: 100%;
                height: 100%;
                fill: currentColor;
                filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
            }

            .coin:nth-child(1) {
                color: #3b82f6;
                animation: coinDrop1 2.5s ease-out infinite;
                z-index: 3;
            }

            .coin:nth-child(2) {
                color: #06d6a0;
                animation: coinDrop2 2.5s ease-out infinite;
                animation-delay: 0.4s;
                z-index: 2;
            }

            .coin:nth-child(3) {
                color: #ffd166;
                animation: coinDrop3 2.5s ease-out infinite;
                animation-delay: 0.8s;
                z-index: 1;
            }

            .brand-text {
                color: white;
                font-size: 24px;
                font-weight: bold;
                letter-spacing: -0.015em;
                line-height: 1.2;
                animation: textFadeIn 3.5s ease-out infinite;
            }

            .loading-text {
                color: #9ca3af;
                font-size: 14px;
                font-weight: 500;
                margin-top: 4px;
                opacity: 0.8;
                animation: pulse 2s ease-in-out infinite;
            }

            @keyframes coinDrop1 {
                0% { opacity: 0; transform: translateY(-80px) scale(0.8) rotate(-10deg); }
                15% { opacity: 1; transform: translateY(-18px) scale(1.05) rotate(5deg); }
                25% { opacity: 1; transform: translateY(-14px) scale(0.98) rotate(-2deg); }
                35% { opacity: 1; transform: translateY(-16px) scale(1) rotate(0deg); }
                90% { opacity: 1; transform: translateY(-16px) scale(1) rotate(0deg); }
                100% { opacity: 0; transform: translateY(-16px) scale(0.9) rotate(0deg); }
            }

            @keyframes coinDrop2 {
                0% { opacity: 0; transform: translateY(-80px) scale(0.8) rotate(-10deg); }
                15% { opacity: 1; transform: translateY(2px) scale(1.05) rotate(5deg); }
                25% { opacity: 1; transform: translateY(-1px) scale(0.98) rotate(-2deg); }
                35% { opacity: 1; transform: translateY(0px) scale(1) rotate(0deg); }
                90% { opacity: 1; transform: translateY(0px) scale(1) rotate(0deg); }
                100% { opacity: 0; transform: translateY(0px) scale(0.9) rotate(0deg); }
            }

            @keyframes coinDrop3 {
                0% { opacity: 0; transform: translateY(-80px) scale(0.8) rotate(-10deg); }
                15% { opacity: 1; transform: translateY(18px) scale(1.05) rotate(5deg); }
                25% { opacity: 1; transform: translateY(14px) scale(0.98) rotate(-2deg); }
                35% { opacity: 1; transform: translateY(16px) scale(1) rotate(0deg); }
                90% { opacity: 1; transform: translateY(16px) scale(1) rotate(0deg); }
                100% { opacity: 0; transform: translateY(16px) scale(0.9) rotate(0deg); }
            }

            @keyframes textFadeIn {
                0% { opacity: 0.3; }
                40% { opacity: 0.5; }
                60% { opacity: 1; }
                90% { opacity: 1; }
                100% { opacity: 0.3; }
            }

            @keyframes pulse {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 0.8; }
            }

            @keyframes stackGlow {
                0% { filter: drop-shadow(0 2px 6px rgba(59, 130, 246, 0.1)); }
                35% { filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.2)); }
                60% { filter: drop-shadow(0 6px 16px rgba(59, 130, 246, 0.3)); }
                90% { filter: drop-shadow(0 8px 20px rgba(59, 130, 246, 0.4)); }
                100% { filter: drop-shadow(0 2px 6px rgba(59, 130, 246, 0.1)); }
            }
        `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  static createLoader() {
    const loaderHTML = `
            <div id="universalLoader" class="universal-loader">
                <div class="loader-content">
                    <div class="logo-stack">
                        <div class="coin">
                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <ellipse cx="24" cy="24" rx="20" ry="7.27" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="coin">
                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <ellipse cx="24" cy="24" rx="20" ry="7.27" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="coin">
                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <ellipse cx="24" cy="24" rx="20" ry="7.27" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                    <div class="brand-section">
                        <div class="brand-text">CoinTracker</div>
                        <div class="loading-text" id="loadingText">Loading...</div>
                    </div>
                </div>
            </div>
        `;
    document.body.insertAdjacentHTML("beforeend", loaderHTML);
    this.loader = document.getElementById("universalLoader");
    this.loadingText = document.getElementById("loadingText");
  }

  static show(message = "Loading...") {
    if (!this.loader) this.init();

    this.loadingText.textContent = message;
    this.loader.classList.add("show");

    // Prevent body scroll when loader is active
    document.body.style.overflow = "hidden";
  }

  static hide() {
    if (!this.loader) return;

    this.loader.classList.remove("show");

    // Restore body scroll
    document.body.style.overflow = "";
  }

  static async withLoader(asyncFunction, message = "Loading...") {
    this.show(message);
    try {
      const result = await asyncFunction();
      return result;
    } catch (error) {
      throw error;
    } finally {
      this.hide();
    }
  }

  // Utility method to customize brand text and colors
  static customize({ brandText, colors } = {}) {
    if (!this.loader) this.init();

    if (brandText) {
      const brandElement = this.loader.querySelector(".brand-text");
      if (brandElement) {
        brandElement.textContent = brandText;
      }
    }

    if (colors && colors.length >= 3) {
      const coins = this.loader.querySelectorAll(".coin");
      coins.forEach((coin, index) => {
        if (colors[index]) {
          coin.style.color = colors[index];
        }
      });
    }
  }
}

// Auto-initialize when DOM is ready (if document exists)
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => UniversalLoader.init());
  } else {
    UniversalLoader.init();
  }
}

// Export for different module systems
if (typeof module !== "undefined" && module.exports) {
  // CommonJS (Node.js)
  module.exports = UniversalLoader;
} else if (typeof exports !== "undefined") {
  // ES Modules fallback
  exports.UniversalLoader = UniversalLoader;
}

// Make available globally (for script tag usage)
if (typeof window !== "undefined") {
  window.UniversalLoader = UniversalLoader;
}

// ES6 Export (if using module bundlers)
export default UniversalLoader;
