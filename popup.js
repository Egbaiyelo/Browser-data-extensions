chrome.runtime.sendMessage({ action: "getData" }, (response) => {
    if (chrome.runtime.lastError) {
        console.error("Message failed:", chrome.runtime.lastError);
    } else {
        document.querySelector("#tabs strong").textContent = `${response.tabs}`;
        document.querySelector("#incognito_tabs strong").textContent = `${response.incognito_tabs}`;
        document.querySelector("#inactive_tabs strong").textContent = `${response.inactive_tabs}`;
        document.querySelector("#windows strong").textContent = `${response.windows}`;
        document.querySelector("#incognito_windows strong").textContent = `${response.incognito_windows}`;
        document.querySelector("#current_window_tabs strong").textContent = `${response.current_window_tabs}`;
        document.querySelector("#bookmarks strong").textContent = `${response.bookmarks}`;
    }
});


