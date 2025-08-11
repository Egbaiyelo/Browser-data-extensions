
chrome.action.setBadgeBackgroundColor({ color: '#eef119ff' });
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
    data.inactive_tabs = tabs.filter(tab => !tab.active).length;
    console.log(data.inactive_tabs);
    // Set Badge
    chrome.action.setBadgeText({ text: data.tabs.toString() });


    // Handle current window
    const currentWindow = await new Promise(resolve => chrome.windows.getLastFocused({ populate: true }, resolve));
    data.current_window_tabs = currentWindow?.tabs?.length || 0;
    console.log("current window",currentWindow, )


    // Handle bookmarks
    const bookmarkTreeNodes = await new Promise(resolve => chrome.bookmarks.getTree(resolve));
    let count = 0;
    function countBookmarks(nodes) {
        nodes.forEach(node => {
            if (node.url) count++;
            if (node.children) countBookmarks(node.children);
        });
    }
    countBookmarks(bookmarkTreeNodes);
    data.bookmarks = count;


    // Get history from last 24 hours
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const historyItems = await new Promise(resolve =>
        chrome.history.search({ text: "", startTime: oneDayAgo, maxResults: 10000 }, resolve)
    );

    const visitedDomains = new Set();
    historyItems.forEach(entry => {
        try {
            const url = new URL(entry.url);
            visitedDomains.add(url.hostname);
        } catch (e) {
            console.warn("Invalid URL skipped:", entry.url);
        }
    });

    console.log(`Visited domains today: ${visitedDomains.size}`);
    console.log(Array.from(visitedDomains));
    console.log(Array.from(historyItems));

    chrome.storage.local.set(data);
    return data;
}


// To run on service worker load
getData();


//--- Subscribing listeners ---
// On popup message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action == "getData") {
        getData().then(data => {
            sendResponse(data);
        })
        return true;
    }
});
// On browser startup
chrome.runtime.onStartup.addListener(() => {
    getData(); // sets badge
})
// On install
chrome.runtime.onInstalled.addListener(() => {
    getData(); // sets badge
});
// 
chrome.action.onClicked.addListener(() => {
    getData();
});


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

    // Initially I used the local storage to reduce the amount of work needed to 
    // handle new tabs but it just results in race conditions
    // chrome.storage.local.get(["tabs", "incognito_tabs"], (data) => {
    //     const _tabs = (data.tabs || 0) + 1;
    //     const _incognito_tabs = (data.incognito_tabs || 0) + (tab.incognito ? 1 : 0);
    //     // No need to check for incognito or inactive, jsut for badge changes
    //     chrome.action.setBadgeText({ text: _tabs.toString() });
    //     chrome.storage.local.set({ tabs: _tabs, incognito_tabs: _incognito_tabs });

    //     // chrome.runtime.sendMessage({
    //     //     action: "updateData",
    //     //     tabs: _tabs,
    //     //     incognito_tabs: _incognito_tabs
    //     // });
    // });
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

    // chrome.storage.local.get(["tabs", "incognito_tabs"], (data) => {

    //     const _tabs = (data.tabs || 0) - 1;
    //     const _incognito_tabs = (data.incognito_tabs || 0) - (removeInfo.incognito ? 1 : 0);

    //     chrome.action.setBadgeText({ text: _tabs.toString() });
    //     chrome.storage.local.set({ tabs: _tabs, incognito_tabs: _incognito_tabs });

    //     // chrome.runtime.sendMessage({
    //     //     action: "updateData",
    //     //     tabs: _tabs,
    //     //     incognito_tabs: _incognito_tabs
    //     // });
    // })
});


// counts everything anyway?
// Update window count
// chrome.windows.onCreated.addListener((window) => {
//     data.windows += 1;
//     if (window.incognito) data.incognito_windows += 1;

//     chrome.runtime.sendMessage({
//         action: "updateData",
//         windows: data.windows,
//         incognito_windows: data.incognito_windows
//     });
// });

// update window removed
// chrome.windows.onRemoved.addListener((windowId) => {
//     chrome.windows.getAll({}, (windows) => {
//         data.windows = windows.length;
//         data.incognito_windows = windows.filter(win => win.incognito).length;

//         chrome.runtime.sendMessage({
//             action: "updateData",
//             windows: data.windows,
//             incognito_windows: data.incognito_windows
//         });
//     });
// });