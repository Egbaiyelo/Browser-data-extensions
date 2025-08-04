
chrome.action.onClicked.addListener(() => {

    let data = {
        "windows": 0,
        "tabs": 0,

        "current_window_tabs": 0,

        "incognito_windows": 0,
        "incognito_tabs": 0,

        "bookmarks": 0,
    }

    // Handle windows
    chrome.windows.getAll({}, (windows) => {
        data.windows = windows.length;
        console.log("Total open windows:", data.windows);

        let incognito_windows = 0;
        windows.forEach(window => {
            if (window.incognito) {
                incognito_windows++;
            }
        });

        data.incognito_windows = incognito_windows;
        console.log("Total incognito windows:", data.incognito_windows);
    });

    // Handle tabs
    chrome.tabs.query({}, (tabs) => {
        data.tabs = tabs.length;
        console.log("Total open tabs:", data.tabs);

        let incognito_tabs = 0;
        tabs.forEach(tab => {
            if (tab.incognito) {
                incognito_tabs++;
            }
        })

        data.incognito_tabs = incognito_tabs;
        console.log("Total incognito tabs:", data.incognito_tabs);
    })

    // Handle current windows tab
    //- propably add to above?
    chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
        if (currentWindow) {
            data.current_window_tabs = currentWindow.tabs ? currentWindow.tabs.length : 0;
            console.log("Current window tab count:", data.current_window_tabs);
        }
    });

    // Handle bookmarks
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        console.log("doing")
        let count = 0;
        function countBookmarks(nodes) {
            for (let node of nodes) {
                if (node.url) {
                    count++;
                }
                if (node.children) {
                    countBookmarks(node.children);
                }
            }
        }
        countBookmarks(bookmarkTreeNodes);
        console.log("Total bookmarks:", count);
        console.log("Bookmarks API:", chrome.bookmarks);
    });
})
