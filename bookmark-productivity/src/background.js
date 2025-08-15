
chrome.action.onClicked.addListener((tab) => {
    console.log("Extension icon clicked!");

    // chrome.scripting.executeScript({
    //     target: { tabId: tab.id },
    //     func: (url, title) => { 
    //         alert("You clicked me")
    //         alert("Got tab" + url)

    //         chrome.runtime.sendMessage({ type: 'createBookmark', url, title });
    //     },
    //     args: [tab.url, tab.title]
    // });

    chrome.bookmarks.getTree((bookmarkTree) => {
        let isBookmarked = false;
        let bookmarkNode;
        const checkBookmarks = (bookmarks) => {
            bookmarks.forEach((bookmark) => {
                if (bookmark.url === tab.url) {
                    isBookmarked = true;
                    bookmarkNode = bookmark;
                }
                if (bookmark.children) {
                    checkBookmarks(bookmark.children);
                }
            });
        };

        checkBookmarks(bookmarkTree);

        chrome.action.setIcon({
            path: isBookmarked ? 'icons/bookmark-ed.svg' : 'icons/bookmark.svg'
        });

        if (isBookmarked) {
            chrome.bookmarks.remove(bookmarkNode.id);
        } else {
            chrome.bookmarks.create({
                title: tab.title,
                url: tab.url
            });
        }
    });
});

// chrome.runtime.onMessage.addListener((message) => {
//     if (message.type === 'createBookmark') {
//         chrome.bookmarks.create({
//             title: message.title,
//             url: message.url
//         }, (node) => {
//             console.log(node);
//         });
//     }
// });