import { FaPaintBrush, FaWindowClose } from "react-icons/fa";
import { FaCode, FaCookie, FaImage, FaGithub } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { TabState } from "./types";

function App() {
  const [state, setState] = useState<TabState | null>(null);
  const [initialState, setInitialState] = useState<TabState | null>(null);
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);
  const [showReload, setShowReload] = useState(false);

  // Check if current state is different from initial state
  const hasChanges =
    state &&
    initialState &&
    JSON.stringify(state) !== JSON.stringify(initialState);

  // Simple XOR encryption key
  const key = "R0cKy3";

  // Decrypt function
  const decrypt = (encoded: string): string => {
    return encoded
      .split("-")
      .map((hex) => parseInt(hex, 16))
      .map((charCode, i) =>
        String.fromCharCode(charCode ^ key.charCodeAt(i % key.length))
      )
      .join("");
  };

  const encryptedAuthor =
    "13-5e-01-3e-0a-56-3e-46-02-25-59-72-3c-5e-02-26-18-5f-33-59";

  useEffect(() => {
    // Get current tab and load its state
    if (!chrome?.storage?.local) {
      console.error("Chrome storage API is not available");
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]?.id) {
        setCurrentTabId(tabs[0].id);
        const data = await chrome.storage.local.get(tabs[0].id.toString());

        // Set default state if no stored state exists
        const defaultState: TabState = {
          disableImages: false,
          blockPopups: false,
          clearCookies: false,
          disableCSS: false,
          disableJS: false,
        };

        const currentState = data[tabs[0].id] || defaultState;
        setState(currentState);
        setInitialState(currentState);
      }
    });
  }, []);

  const handleCheckboxChange = (key: keyof TabState) => {
    setState((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const handleApplyChanges = async () => {
    if (!currentTabId) return;
    if (!chrome?.storage?.local) {
      console.error("Chrome storage API is not available");
      return;
    }

    // Save state for this tab
    await chrome.storage.local.set({ [currentTabId]: state });

    // Send message to content script
    chrome.tabs.sendMessage(currentTabId, {
      action: "applyChanges",
      tabId: currentTabId,
      state,
    });

    // Update initial state to match current state
    setInitialState(state);
    // Show reload button after changes are applied
    setShowReload(true);
  };

  const handleReset = async () => {
    if (!currentTabId) return;
    if (!chrome?.storage?.local) {
      console.error("Chrome storage API is not available");
      return;
    }

    const defaultState: TabState = {
      disableImages: false,
      blockPopups: false,
      clearCookies: false,
      disableCSS: false,
      disableJS: false,
    };

    setState(defaultState);
    setInitialState(defaultState);
    await chrome.storage.local.set({ [currentTabId]: defaultState });

    // Send reset state to content script
    chrome.tabs.sendMessage(currentTabId, {
      action: "applyChanges",
      tabId: currentTabId,
      state: defaultState,
    });

    // Show reload button after reset is applied
    setShowReload(true);
  };

  const handleReload = () => {
    if (currentTabId) {
      chrome.tabs.reload(currentTabId);
    }
  };

  // Only render the main content when state is loaded
  if (!state || !initialState) {
    return (
      <div className="max-w-4xl w-96 mx-auto bg-white rounded-lg p-6">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-96 mx-auto bg-white rounded-lg">
      <main className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Disable UI</h1>
          <span className="text-sm text-gray-500">(Experiment)</span>
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
              checked={state.disableCSS}
              onChange={() => handleCheckboxChange("disableCSS")}
            />
            <FaPaintBrush className="text-gray-700" />
            <span className="text-gray-700">Disable CSS</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
              checked={state.disableJS}
              onChange={() => handleCheckboxChange("disableJS")}
            />
            <FaCode className="text-gray-700" />
            <span className="text-gray-700">Disable JavaScript</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
              checked={state.disableImages}
              onChange={() => handleCheckboxChange("disableImages")}
            />
            <FaImage className="text-gray-700" />
            <span className="text-gray-700">Disable Images</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
              checked={state.blockPopups}
              onChange={() => handleCheckboxChange("blockPopups")}
            />
            <FaWindowClose className="text-gray-700" />
            <span className="text-gray-700">Block Popups</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
              checked={state.clearCookies}
              onChange={() => handleCheckboxChange("clearCookies")}
            />
            <FaCookie className="text-gray-700" />
            <span className="text-gray-700">Clear Cookies</span>
          </label>
        </div>

        <div className="mt-6 space-y-2">
          {hasChanges && (
            <>
              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                onClick={handleApplyChanges}
              >
                Apply Changes
              </button>
              <button
                type="button"
                className="w-full text-gray-600 rounded-lg"
                onClick={handleReset}
              >
                Reset Settings
              </button>
            </>
          )}
          {showReload && (
            <button
              onClick={handleReload}
              className="mt-2 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Reload Page
            </button>
          )}
        </div>
      </main>

      <div className="bg-blue-500 text-white font-semibold p-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-center flex-1">
            created by
            <a
              href="https://github.com/anburocky3"
              target="_blank"
              className="text-yellow-400 hover:text-yellow-500 ml-1"
            >
              {decrypt(encryptedAuthor)}
            </a>
          </p>
          <div className="text-right">
            <a
              href="https://github.com/anburocky3/disable-css-js-extension"
              target="_blank"
              className="text-white hover:text-grey-600 inline-block mt-1"
            >
              <FaGithub size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
