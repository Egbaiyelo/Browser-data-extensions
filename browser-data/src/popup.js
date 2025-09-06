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

document.addEventListener('DOMContentLoaded', () => {
    const settings = document.querySelector('nav');

    const settings_page = document.getElementById('settings_page');
    const main_page = document.getElementById('main_page');

    const settings_button = document.getElementById('settings_button');
    const back_button = document.getElementById('back_button');

    back_button.addEventListener('click', () => {
        settings_page.style.display = 'none';
        main_page.style.display = 'block';
    });
    // 

    settings_button.addEventListener('click', () => {
        settings_page.style.display = 'block';
        main_page.style.display = 'none';
    });
});

const badgeTextColor = document.getElementById('badgeTextColor');
const badgeBgColor = document.getElementById('badgeBgColor');

window.addEventListener('load', () => {
    chrome.storage.sync.get(['badgeTextColor', 'badgeBgColor'], (result) => {
        if (result.badgeTextColor) {
            badgeTextColor.value = result.badgeTextColor;
        }
        if (result.badgeBgColor) {
            badgeBgColor.value = result.badgeBgColor;
        }
    });
});

badgeTextColor.addEventListener('change', () => {
    console.log("hello")
    const newColor = badgeTextColor.value;
    chrome.runtime.sendMessage({ action: "setBadgeTextColor", color: newColor });
    chrome.storage.sync.set({ badgeTextColor: newColor });
});

badgeBgColor.addEventListener('change', () => {
    const newColor = badgeBgColor.value;
    chrome.runtime.sendMessage({ action: "setBadgeBgColor", color: newColor });
    chrome.storage.sync.set({ badgeBgColor: newColor });
});