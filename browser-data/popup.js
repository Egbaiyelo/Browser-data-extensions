chrome.runtime.sendMessage({ action: "getData" }, (response) => {
    if (chrome.runtime.lastError) {
        console.error("Message failed:", chrome.runtime.lastError);
    } else {
        document.getElementById("tabs").textContent = `Total Tabs: ${response.tabs}`;
        document.getElementById("incognito_tabs").textContent = `Incognito Tabs: ${response.incognito_tabs}`;
        document.getElementById("windows").textContent = `Total windows: ${response.windows}`;
        document.getElementById("incognito_windows").textContent = `Incognito windows: ${response.incognito_windows}`;
        document.getElementById("current_window_tabs").textContent = `Current Window tabs: ${response.current_window_tabs}`;
        document.getElementById("bookmarks").textContent = `Bookmarks: ${response.bookmarks}`;
    }
});

// chrome.runtime.onMessage.addListener((message) => {
//     if (message.action === "updateData") {
//         document.getElementById("tabs").textContent = `Total Tabs: ${message.tabs}`;
//         document.getElementById("incognito_tabs").textContent = `Incognito Tabs: ${message.incognito_tabs}`;
//         document.getElementById("windows").textContent = `Total windows: ${message.windows}`;
//         document.getElementById("incognito_windows").textContent = `Incognito windows: ${message.incognito_windows}`;
//     }
// });
