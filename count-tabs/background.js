chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let data = {
        windows: 0,
        tabs: 0,
        current_window_tabs: 0,
        incognito_windows: 0,
        incognito_tabs: 0,
        bookmarks: 0,
    };

    // Handle windows
    chrome.windows.getAll({}, (windows) => {
        data.windows = windows.length;
        data.incognito_windows = windows.filter(win => win.incognito).length;

        // Handle tabs
        chrome.tabs.query({}, (tabs) => {
            data.tabs = tabs.length;
            data.incognito_tabs = tabs.filter(tab => tab.incognito).length;

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

                    sendResponse(data); 
                });
            });
        });
    });

    return true; 
});