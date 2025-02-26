import { TabState } from "../types";

// Get references to the checkboxes and button
const disableImagesCheckbox = document.getElementById(
  "disable-images"
) as HTMLInputElement;
const blockPopupsCheckbox = document.getElementById(
  "block-popups"
) as HTMLInputElement;
const clearCookiesCheckbox = document.getElementById(
  "clear-cookies"
) as HTMLInputElement;
const disableCSSCheckbox = document.getElementById(
  "disable-css"
) as HTMLInputElement;
const disableJSCheckbox = document.getElementById(
  "disable-js"
) as HTMLInputElement;
const applyButton = document.getElementById("apply") as HTMLButtonElement;
const resetButton = document.getElementById("reset") as HTMLButtonElement;
const reloadButton = document.getElementById("reload") as HTMLButtonElement;
const author = document.getElementById("author") as HTMLAnchorElement;

let currentTabId: number;

// encode author name
author.innerText = atob("QW5idXNlbHZhbiBBbm5hbWFsYWk=");

// Get current tab
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  if (tabs[0]?.id) {
    currentTabId = tabs[0].id;
    // Load saved state for this tab
    const data = await chrome.storage.local.get(currentTabId.toString());
    const tabState = data[currentTabId] || {
      disableImages: false,
      blockPopups: false,
      clearCookies: false,
      disableCSS: false,
      disableJS: false,
    };

    // Set checkbox states
    disableImagesCheckbox.checked = tabState.disableImages;
    blockPopupsCheckbox.checked = tabState.blockPopups;
    clearCookiesCheckbox.checked = tabState.clearCookies;
    disableCSSCheckbox.checked = tabState.disableCSS;
    disableJSCheckbox.checked = tabState.disableJS;
  }
});

// Show the Reload button when any checkbox is clicked
const checkboxes = [
  disableImagesCheckbox,
  blockPopupsCheckbox,
  clearCookiesCheckbox,
  disableCSSCheckbox,
  disableJSCheckbox,
];
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    reloadButton.classList.remove("hidden");
  });
});

// Save state and apply changes
applyButton.addEventListener("click", async () => {
  const newState: TabState = {
    disableImages: disableImagesCheckbox.checked,
    blockPopups: blockPopupsCheckbox.checked,
    clearCookies: clearCookiesCheckbox.checked,
    disableCSS: disableCSSCheckbox.checked,
    disableJS: disableJSCheckbox.checked,
  };

  // Save state for this tab
  await chrome.storage.local.set({ [currentTabId]: newState });

  // Send message to content script
  chrome.tabs.sendMessage(currentTabId, {
    action: "applyChanges",
    tabId: currentTabId,
    state: newState,
  });
});

// Reset button handler
resetButton.addEventListener("click", async () => {
  const defaultState: TabState = {
    disableImages: false,
    blockPopups: false,
    clearCookies: false,
    disableCSS: false,
    disableJS: false,
  };

  // Reset state for this tab
  await chrome.storage.local.set({ [currentTabId]: defaultState });

  // Update checkboxes
  disableImagesCheckbox.checked = false;
  blockPopupsCheckbox.checked = false;
  clearCookiesCheckbox.checked = false;
  disableCSSCheckbox.checked = false;
  disableJSCheckbox.checked = false;

  // Send reset state to content script
  chrome.tabs.sendMessage(currentTabId, {
    action: "applyChanges",
    tabId: currentTabId,
    state: defaultState,
  });
});

// Reload button handler
reloadButton.addEventListener("click", () => {
  chrome.tabs.reload(currentTabId);
});
