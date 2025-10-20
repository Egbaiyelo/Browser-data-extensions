

let data = {
    windows: 0,
    tabs: 0,
    current_window_tabs: 0,
    inactive_tabs: 0,
    incognito_windows: 0,
    incognito_tabs: 0,
    bookmarks: 0,
};

// --- Getting data and setting badge
async function getData() {

    // Handle windows
    const windows = await new Promise(resolve => chrome.windows.getAll({}, resolve));
    data.windows = windows.length;
    data.incognito_windows = windows.filter(win => win.incognito).length;


    // Handle tabs
    const tabs = await new Promise(resolve => chrome.tabs.query({}, resolve));
    data.tabs = tabs.length;
    data.incognito_tabs = tabs.filter(tab => tab.incognito).length;
    data.inactive_tabs = tabs.filter(tab => tab.discarded).length;
    // Set Badge
    chrome.action.setBadgeText({ text: data.tabs.toString() });


    // Handle current window
    const currentWindow = await new Promise(resolve => chrome.windows.getLastFocused({ populate: true }, resolve));
    data.current_window_tabs = currentWindow?.tabs?.length || 0;
    // console.log("current window", currentWindow,)


    // Handle bookmarks
    // const bookmarkTreeNodes = await new Promise(resolve => chrome.bookmarks.getTree(resolve));
    // let count = 0;
    // function countBookmarks(nodes) {
    //     nodes.forEach(node => {
    //         if (node.url) count++;
    //         if (node.children) countBookmarks(node.children);
    //     });
    // }
    // countBookmarks(bookmarkTreeNodes);
    // data.bookmarks = count;


    // Get tab title 
    let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab) {

    }

    chrome.storage.local.set(data);
    return data;
}


// To run on service worker load
getData();






















// --- Listening for badge changes ---
// Update tabs
chrome.tabs.onCreated.addListener((tab) => {
    chrome.tabs.query({}, (tabs) => {
        const _tabs = tabs.length;
        const _incognito_tabs = tabs.filter(t => t.incognito).length;

        chrome.action.setBadgeText({ text: _tabs.toString() });
        chrome.storage.local.set({
            tabs: _tabs,
            incognito_tabs: _incognito_tabs
        });
    })

    // Get tab age
    let createdTabID;

    // Get the ID of the mostr recently created tab (hopefully)
    (async function () {
        let tabs = await chrome.tabs.query({ lastFocusedWindow: true });

        if (tabs.length > 0) {
            // sort tabs by ID to get highest (most recent) tab
            tabs.sort((a, b) => b.id - a.id);
            createdTabID = tabs[0].id;
        }
    })()

    const now = new Date();
    if (createdTabID)
        chrome.storage.local.set({ createdTabID: now.gettime() });

});

// Update tabs remove
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.tabs.query({}, (tabs) => {
        const _tabs = tabs.length;
        const _incognito_tabs = tabs.filter(t => t.incognito).length;

        chrome.action.setBadgeText({ text: _tabs.toString() });
        chrome.storage.local.set({
            tabs: _tabs,
            incognito_tabs: _incognito_tabs
        });
    })
});







// ******************
// *** Subscribing Listeners ***

// on browser startup and install
chrome.runtime.onInstalled.addListener(async () => {
    console.log("Extension Installed");

    // Setting default styles
    chrome.action.setBadgeBackgroundColor({ color: '#FFFF00' });
    chrome.action.setBadgeTextColor({ color: '#000000' });
    chrome.storage.sync.set({ badgeBgColor: "#FFFF00", badgeTextColor: "#000000" });

    await getData();
    // await updateHeavyStats();
});
chrome.runtime.onStartup.addListener(getData);
chrome.action.onClicked.addListener(getData);


// Update data when tabs or windows change
chrome.tabs.onCreated.addListener(getData);
chrome.tabs.onRemoved.addListener(getData);
chrome.windows.onCreated.addListener(getData);
chrome.windows.onRemoved.addListener(getData);

// Handling messages from Popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getData") {
        getData().then(updatedData => sendResponse(updatedData));
        return true; 
    }

    if (message.action === "updateSettings") {
        if (message.type === "badgeBg") chrome.action.setBadgeBackgroundColor({ color: message.color });
        if (message.type === "badgeText") chrome.action.setBadgeTextColor({ color: message.color });
    }
});

// update bookmarks
// chrome.bookmarks.onCreated.addListener(updateHeavyStats);
// chrome.bookmarks.onRemoved.addListener(updateHeavyStats);



















// Get history from last 24 hours
    // const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    // const historyItems = await new Promise(resolve =>
    //     chrome.history.search({ text: "", startTime: oneDayAgo, maxResults: 10000 }, resolve)
    // );

    // const visitedDomains = new Set();
    // historyItems.forEach(entry => {
    //     try {
    //         const url = new URL(entry.url);
    //         visitedDomains.add(url.hostname);
    //     } catch (e) {
    //         console.warn("Invalid URL skipped:", entry.url);
    //     }
    // });

    // // console.log(`Visited domains today: ${visitedDomains.size}`);
    // // console.log(Array.from(visitedDomains));
    // // console.log(Array.from(historyItems));