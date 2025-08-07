
chrome.action.setBadgeBackgroundColor({ color: '#eef119ff' });
let data = {
    windows: 0,
    tabs: 0,
    current_window_tabs: 0,
    incognito_windows: 0,
    incognito_tabs: 0,
    bookmarks: 0,
};


function oldGetData() {

    // Handle windows
    chrome.windows.getAll({}, (windows) => {
        data.windows = windows.length;
        data.incognito_windows = windows.filter(win => win.incognito).length;

        // Handle tabs
        chrome.tabs.query({}, (tabs) => {
            data.tabs = tabs.length;
            data.incognito_tabs = tabs.filter(tab => tab.incognito).length;
            // Set Badge
            chrome.action.setBadgeText({ text: data.tabs.toString() });

            // Handle current window
            chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
                data.current_window_tabs = currentWindow?.tabs?.length || 0;

                // Handle bookmarks
                chrome.bookmarks.getTree((bookmarkTreeNodes) => {
                    let count = 0;
                    function countBookmarks(nodes) {
                        nodes.forEach(node => {
                            if (node.url) count++;
                            if (node.children) countBookmarks(node.children);
                        });
                    }
                    countBookmarks(bookmarkTreeNodes);
                    data.bookmarks = count;

                    const oneDayAgo = (new Date()).getTime() - (24 * 60 * 60 * 1000);

                    chrome.history.search({
                        text: "",
                        startTime: oneDayAgo,
                        maxResults: 10000
                    }, (results) => {
                        const visitedDomains = new Set();

                        results.forEach(entry => {
                            try {
                                const url = new URL(entry.url);
                                visitedDomains.add(url.hostname);
                            } catch (e) {
                                console.warn("Invalid URL skipped:", entry.url);
                            }
                        });

                        console.log(`Visited domains today: ${visitedDomains.size}`);
                        console.log(Array.from(visitedDomains));
                        console.log(Array.from(results));
                    });

                    console.log("**************************")
                    chrome.storage.local.set(data);
                    return data;
                });
            });
        });
    });

    console.log(
        "((((((((((((((((((((((((((((((9"
    )
    chrome.storage.local.set(data);
    return data;
}
async function getData() {

    // Handle windows
    const windows = await new Promise(resolve => chrome.windows.getAll({}, resolve));
    data.windows = windows.length;
    data.incognito_windows = windows.filter(win => win.incognito).length;


    // Handle tabs
    const tabs = await new Promise(resolve => chrome.tabs.query({}, resolve));
    data.tabs = tabs.length;
    data.incognito_tabs = tabs.filter(tab => tab.incognito).length;
    // Set Badge
    chrome.action.setBadgeText({ text: data.tabs.toString() });


    // Handle current window
    const currentWindow = await new Promise(resolve => chrome.windows.getCurrent({ populate: true }, resolve));
    data.current_window_tabs = currentWindow?.tabs?.length || 0;


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
    console.log("**************************");

    chrome.storage.local.set(data);
    return data;
}


//--- Subscribing listeners ---
// On popup message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action == "getData") {
        console.log("got here~~~~~~~~~~~~")
        getData().then(data => {
            sendResponse(data);
        })
        chrome.storage.local.get("tabs", (data) => {
            console.log("here data", data)
        })
        return true;
    }
});
// On browser startup
chrome.runtime.onStartup.addListener(() => {
    // chrome.runtime.sendMessage({ action: "getData" }, (response) => { });
    getData();
})
// On install
chrome.runtime.onInstalled.addListener(() => {
    // chrome.runtime.sendMessage({ action: "getData" }, (response) => { });
    getData();
});
// 
chrome.action.onClicked.addListener(() => {
    // chrome.runtime.sendMessage({ action: "updateData" }, (response) => { });
    getData();
})




// Future syncing update, update badge and count on startup maybe
// - Still no need to update popup

//- Update tabs and remove laggy
// Update tabs
chrome.tabs.onCreated.addListener((tab) => {
    chrome.storage.local.get(["tabs", "incognito_tabs"], (data) => {

        const _tabs = (data.tabs || 0) + 1;
        console.log(data, data.tabs, _tabs)
        const _incognito_tabs = (data.incognito_tabs || 0) + (tab.incognito ? 1 : 0);

        chrome.action.setBadgeText({ text: _tabs.toString() });
        chrome.storage.local.set({ tabs: _tabs, incognito_tabs: _incognito_tabs });

        chrome.runtime.sendMessage({
            action: "updateData",
            tabs: _tabs,
            incognito_tabs: _incognito_tabs
        });
    });
});

// Update tabs remove
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.storage.local.get(["tabs", "incognito_tabs"], (data) => {

        const _tabs = (data.tabs || 0) - 1;
        console.log(data, data.tabs, _tabs)
        const _incognito_tabs = (data.incognito_tabs || 0) - (removeInfo.incognito ? 1 : 0);

        console.log('got update - remove')
        chrome.action.setBadgeText({ text: _tabs.toString() });
        chrome.storage.local.set({ tabs: _tabs, incognito_tabs: _incognito_tabs });

        chrome.runtime.sendMessage({
            action: "updateData",
            tabs: _tabs,
            incognito_tabs: _incognito_tabs
        });
    })
});


// counts everything anyway?
// Update window count
chrome.windows.onCreated.addListener((window) => {
    data.windows += 1;
    if (window.incognito) data.incognito_windows += 1;

    chrome.runtime.sendMessage({
        action: "updateData",
        windows: data.windows,
        incognito_windows: data.incognito_windows
    });
});

// update window removed
chrome.windows.onRemoved.addListener((windowId) => {
    chrome.windows.getAll({}, (windows) => {
        data.windows = windows.length;
        data.incognito_windows = windows.filter(win => win.incognito).length;

        chrome.runtime.sendMessage({
            action: "updateData",
            windows: data.windows,
            incognito_windows: data.incognito_windows
        });
    });
});