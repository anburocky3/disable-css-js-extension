interface TabState {
  disableImages: boolean;
  blockPopups: boolean;
  clearCookies: boolean;
  disableCSS: boolean;
  disableJS: boolean;
}

interface StorageData {
  [tabId: string]: TabState;
}

interface ApplyChangesMessage {
  action: "applyChanges";
  tabId: number;
  state: TabState;
}

interface TabStateChangeMessage {
  action: "tabStateChanged";
  tabId: number;
  state: TabState;
}

export type {
  TabState,
  StorageData,
  ApplyChangesMessage,
  TabStateChangeMessage,
};
