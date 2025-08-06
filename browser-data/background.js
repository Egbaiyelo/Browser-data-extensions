
chrome.action.setBadgeBackgroundColor({ color: '#eef119ff' });
let data = {
    windows: 0,
    tabs: 0,
    current_window_tabs: 0,
    incognito_windows: 0,
    incognito_tabs: 0,
    bookmarks: 0,
};


function getData() {

    console.log("got message")
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

                    return data;
                });
            });
        });
    });

    return data;
}


//--- Subscribing listeners ---
// On popup message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action = "getData") {
        sendResponse(getData())
        return true;
    }
});
// On browser startup
chrome.runtime.onStartup.addListener(() => {
    chrome.runtime.sendMessage({ action: "getData" }, (response) => { });
    getData();
})
// On install
chrome.runtime.onInstalled.addListener(() => {
    chrome.runtime.sendMessage({ action: "getData" }, (response) => { });
    getData();
})




// Future syncing update, update badge and count on startup maybe
// - Still no need to update popup

// Update tabs
chrome.tabs.onCreated.addListener((tab) => {
    if (tab.incognito) data.incognito_tabs += 1;
    data.tabs += 1;

    console.log('got update - add');
    chrome.action.setBadgeText({ text: data.tabs.toString() });

    chrome.runtime.sendMessage({
        action: "updateData",
        tabs: data.tabs,
        incognito_tabs: data.incognito_tabs
    });
});

// Update tabs remove
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if (removeInfo.incognito) { data.incognito_tabs -= 1; }
    data.tabs -= 1;

    console.log('got update - remove')
    chrome.action.setBadgeText({ text: data.tabs.toString() });

    chrome.runtime.sendMessage({
        action: "updateData",
        tabs: data.tabs,
        incognito_tabs: data.incognito_tabs
    });
});

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