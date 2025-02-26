import { TabState, ApplyChangesMessage } from "../types";

let currentTabId: number;

// Get current tab ID
chrome.runtime.sendMessage({ action: "getCurrentTab" }, (response) => {
  currentTabId = response.tabId;
  // Load initial state for this tab
  chrome.storage.local.get(currentTabId.toString(), (data) => {
    if (data[currentTabId]) {
      applyChanges(data[currentTabId]);
    }
  });
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(
  (message: ApplyChangesMessage, sender, sendResponse) => {
    console.log("message", message);
    console.log("sender", sender);
    console.log("sendResponse", sendResponse);
    if (message.action === "applyChanges" && message.tabId === currentTabId) {
      applyChanges(message.state);
    }
  }
);

// Function to apply changes
function applyChanges(state: TabState) {
  if (state.disableImages) {
    const images = document.querySelectorAll("img");
    images.forEach((img) => img.remove());
    // Also prevent new images from loading
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLImageElement) {
            node.remove();
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (state.blockPopups) {
    window.open = () => null;
  }

  if (state.clearCookies) {
    chrome.cookies.getAll({}, (cookies) => {
      cookies.forEach((cookie) => {
        const url = `http${cookie.secure ? "s" : ""}://${cookie.domain}${
          cookie.path
        }`;
        chrome.cookies.remove({ url, name: cookie.name });
      });
    });
  }

  if (state.disableCSS) {
    const stylesheets = document.querySelectorAll(
      'link[rel="stylesheet"], style'
    );
    stylesheets.forEach((style) => style.remove());
    // Prevent new stylesheets
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (
            node instanceof HTMLStyleElement ||
            (node instanceof HTMLLinkElement && node.rel === "stylesheet")
          ) {
            node.remove();
          }
        });
      });
    });
    observer.observe(document.head, { childList: true, subtree: true });
  }

  if (state.disableJS) {
    const scripts = document.querySelectorAll("script");
    scripts.forEach((script) => script.remove());
    // Prevent new scripts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLScriptElement) {
            node.remove();
          }
        });
      });
    });
    observer.observe(document, { childList: true, subtree: true });
  }
}
