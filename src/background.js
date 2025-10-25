

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
    const allWindows = await chrome.windows.getAll({populate: false});
    data.windows = allWindows.length;
    data.incognito_windows = allWindows.filter(win => win.incognito).length;


    // Handle tabs
    const allTabs = await chrome.tabs.query({});
    console.log(allTabs)
    data.tabs = allTabs.length;
    data.incognito_tabs = allTabs.filter(tab => tab.incognito).length;
    data.inactive_tabs = allTabs.filter(tab => tab.discarded).length;
    // Set Badge
    chrome.action.setBadgeText({ text: data.tabs.toString() });


    // Handle current window
    const currentWindow = await chrome.windows.getLastFocused({ populate: true});
    data.current_window_tabs = currentWindow?.tabs?.length || 0;

    // Get tab title 
    let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab) {

    }

    await chrome.storage.local.set(data);
    return data;
}

async function getOtherData(){
    // Handle bookmarks
    const tree = await chrome.bookmarks.getTree();
    let count = 0;
    const countNodes = (nodes) => {
        nodes.forEach(n => {
            if (n.url) count++;
            if (n.children) countNodes(n.children);
        });
    };
    countNodes(tree);
    await chrome.storage.local.set({ bookmarks: count });
    data.bookmarks = count;
}

// To run when service worker loads
getData();



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


// --- Listening for badge changes ---
// Update tabs
chrome.tabs.onCreated.addListener( async (tab) => {
    chrome.tabs.query({}, (tabs) => {
        const _tabs = tabs.length;
        const _incognito_tabs = tabs.filter(t => t.incognito).length;

        chrome.action.setBadgeText({ text: _tabs.toString() });
        chrome.storage.local.set({
            tabs: _tabs,
            incognito_tabs: _incognito_tabs
        });
    })

    // Getting tab age
    const tabKey = `age_${tab.id}`;
    await chrome.storage.local.set({ [tabKey]: Date.now() });
});

// Update tabs remove
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
    chrome.tabs.query({}, (tabs) => {
        const _tabs = tabs.length;
        const _incognito_tabs = tabs.filter(t => t.incognito).length;

        chrome.action.setBadgeText({ text: _tabs.toString() });
        chrome.storage.local.set({
            tabs: _tabs,
            incognito_tabs: _incognito_tabs
        });

    })
    await chrome.storage.local.remove(`age_${tabId}`);
});


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

    // for async logs
    if (message.action === "log") console.log("--", message.log, message.data);
});

// update bookmarks
// chrome.bookmarks.onCreated.addListener(updateOtherData);
// chrome.bookmarks.onRemoved.addListener(updateOtherData);


// ***************************************************88888



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

    