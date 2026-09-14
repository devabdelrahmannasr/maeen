chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: false })
    .catch((error) => console.error('تعذر إعداد فتح اللوحة الجانبية.', error));
});

chrome.action.onClicked.addListener((tab) => {
  if (typeof tab.id !== 'number') {
    return;
  }

  chrome.sidePanel
    .open({ tabId: tab.id })
    .catch((error) => console.error('تعذر فتح اللوحة الجانبية.', error));
});
