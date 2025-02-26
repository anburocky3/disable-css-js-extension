import { TabState } from "../types";

// Placeholder for background tasks
console.log("Background script loaded");

// Initialize tab state when created or updated
chrome.tabs.onUpdated.addListener(
  (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
    if (changeInfo.status === "complete") {
      initializeTabState(tabId);
    }
  }
);

// Clean up tab state when removed
chrome.tabs.onRemoved.addListener((tabId) => {
  removeTabState(tabId);
});

// Initialize tab state
async function initializeTabState(tabId: number) {
  const storage = await chrome.storage.local.get(tabId.toString());
  if (!storage[tabId]) {
    const defaultState: TabState = {
      disableImages: false,
      blockPopups: false,
      clearCookies: false,
      disableCSS: false,
      disableJS: false,
    };
    await chrome.storage.local.set({ [tabId]: defaultState });
  }
}

// Remove tab state
async function removeTabState(tabId: number) {
  await chrome.storage.local.remove(tabId.toString());
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getTabState") {
    chrome.storage.local.get(message.tabId.toString(), (result) => {
      sendResponse(result[message.tabId] || null);
    });
    return true;
  }
  if (message.action === "getCurrentTab") {
    if (sender.tab?.id) {
      sendResponse({ tabId: sender.tab.id });
    }
    return true;
  }
});
