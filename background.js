
chrome.action.onClicked.addListener((tab) => {
    console.log("Extension icon clicked!");

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (url) => { 
            alert("You clicked me")
            alert("Got tab" + url)
            let bookmark = bookmarks.create({
                title: "bookmarks.create() on MDN",
                url: tab.url,
                
            }).then(console.log(node))
            chrome.runtime.sendMessage({ type: 'createBookmark', url });
        },
        args: [tab.url]
    });
});
