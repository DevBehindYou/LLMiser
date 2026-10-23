// The toolbar grants activeTab. No automatic captures or persistent website
// access are registered. Settings survive service-worker suspension.
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
