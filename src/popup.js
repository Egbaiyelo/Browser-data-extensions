
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

        // console.log("tab id", getCurrentTabId())
        // document.querySelector("#tab_age").textContent = `${getLife(chrome.local.storage.get(getCurrentTabId()))}`;

        // console.log("time is",getLastAccessedTime())
        (async function () {
            let tabAccessed = await getLastAccessedTime();
            console.log("tabby access", tabAccessed);
            document.querySelector("#tab_age").textContent = `${await getCurrentTabAge()}`;
            // formerly get last accessed time
        })()

            // Get last accessed time
            (async function () {
                try {
                    let tabAccessed = await getLastAccessedTime();
                    document.querySelector("#tab_age").textContent = tabAccessed;
                } catch (error) {
                    console.error("Failed to update tab age:", error);
                    document.querySelector("#tab_age").textContent = "(Can't find)";
                }
            })()
    }
});

document.addEventListener('DOMContentLoaded', () => {

    // --- ---
    badgeTextColor = document.getElementById('badgeTextColor');
    badgeBgColor = document.getElementById('badgeBgColor');



    chrome.runtime.sendMessage({ action: "log", log: "badgetext color again", content: badgeTextColor.value });

    badgeTextColor.addEventListener('change', () => {
        chrome.runtime.sendMessage({ action: "log", log: "badgetext color change", content: badgeTextColor.value });
        const newColor = badgeTextColor.value;
        chrome.runtime.sendMessage({ action: "updateSettings", type: "badgeText", color: newColor });
        chrome.storage.sync.set({ badgeTextColor: newColor });
    });

    badgeBgColor.addEventListener('change', () => {
        const newColor = badgeBgColor.value;
        chrome.runtime.sendMessage({ action: "updateSettings", type: "badgeBg", color: newColor });
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




// ******************
// *** Functions ***


/**
 * 
 * @returns 
 */
async function getCurrentTabId() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log("tab___________", tab)
    let tryu = new Date(tab.lastAccessed)
    console.log(tryu.toISOString())
    return tab.id;
}


/** Temporary overide with last accessed */

/**
 * 
 * @returns 
 */
async function getLastAccessedTime() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return new Date(tab.lastAccessed).toISOString();
}


/**
 * 
 * @returns 
 */
async function getCurrentTabTimeData() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const result = await chrome.storage.local.get(`age_${tab.id}`);
    const startTime = result[`age_${tab.id}`];

    const lastAccessed = tab.lastAccessed;

    if (!startTime) return "Unknown";

    console.log(tab.lastAccessed);
    chrome.runtime.sendMessage({ action: "log", log: "last accessed", data: tab });
    return toReadableString(lastAccessed);
}

/**
 * 
 * @param {*} startTime 
 * @returns 
 */
function toReadableString(startTime) {
    const secsInMin = 60
    const secsInHour = 60 * 60
    const secsInDay = 24 * 3600

    const ageInDays = Math.floor((Date.now() - startTime) / (secsInDay * 1000));
    const ageInHours = Math.floor((Date.now() - startTime) / (secsInHour * 1000));
    const ageInMinutes = Math.floor((Date.now() - startTime) / (secsInMin * 1000));

    const plural = (val, unit) => `${val} ${unit}${val !== 1 ? 's' : ''}`;

    // return first two
    if (ageInDays > 0)
        return `${plural(ageInDays, 'day')}, ${plural(ageInHours, 'hr')} ago`
    else if (ageInHours > 0)
        return `${plural(ageInHours, 'hr')}, ${plural(ageInMinutes, 'min')} ago`
    else
        return `${plural(ageInMinutes, 'min')} ago`
}
