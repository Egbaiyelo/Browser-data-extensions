
let badgeTextColor;
let badgeBgColor;
let allElements;
let listing;


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
        

        document.querySelector("#tab_age").textContent = `${getLife()}`;

    }
});

document.addEventListener('DOMContentLoaded', () => {

    // --- ---
    badgeTextColor = document.getElementById('badgeTextColor');
    badgeBgColor = document.getElementById('badgeBgColor');
    chrome.runtime.sendMessage({ action: "log", log: "badgetext color again", content: badgeTextColor.value });

    badgeTextColor.addEventListener('change', () => {
        chrome.runtime.sendMessage({ action: "log", log: "badgetext color chnage", content: badgeTextColor.value });
        const newColor = badgeTextColor.value;
        chrome.runtime.sendMessage({ action: "setBadgeTextColor", color: newColor });
        chrome.storage.sync.set({ badgeTextColor: newColor });
    });

    badgeBgColor.addEventListener('change', () => {
        const newColor = badgeBgColor.value;
        chrome.runtime.sendMessage({ action: "setBadgeBgColor", color: newColor });
        chrome.storage.sync.set({ badgeBgColor: newColor });
    });


    // --- ---
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




// Functions
function getLife(start){
    const date = new Date();
    const age = date.getTime() - start;

    return new Date(age);
}