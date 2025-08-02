
chrome.action.onClicked.addListener((tab) => {
    console.log("Extension icon clicked!");

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => { alert("clieckr me")}
    });
});


// chrome.action.onClicked.addListener((tab) => {
//   console.log("Extension icon clicked!");
// });