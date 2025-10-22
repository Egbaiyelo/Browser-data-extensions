
// let badgeTextColor;
// let badgeBgColor;
// let allElements;
// let listing;

document.addEventListener('DOMContentLoaded', async () => {
    // --- ---
    // UI elements
    badgeTextColor = document.getElementById('badgeTextColor');
    badgeBgColor = document.getElementById('badgeBgColor');

    const settings = document.querySelector('nav');
    const settings_page = document.getElementById('settings_page');
    const settings_button = document.getElementById('settings_button');
    const main_page = document.getElementById('main_page');
    const back_button = document.getElementById('back_button');

    // Data elements
    const tabs = document.querySelector("#tabs strong")
    const incognito_tabs = document.querySelector("#incognito_tabs strong")
    const inactive_tabs = document.querySelector("#inactive_tabs strong")
    const windows = document.querySelector("#windows strong")
    const incognito_windows = document.querySelector("#incognito_windows strong")
    const current_window_tabs = document.querySelector("#current_window_tabs strong")
    const bookmarks = document.querySelector("#bookmarks strong")
    const tab_age = document.querySelector("#tab_age")


    // updating elements
    await chrome.runtime.sendMessage({ action: "getData" }, async (response) => {
        if (!response) return;

        // Update stats
        tabs.textContent = response.tabs;
        incognito_tabs.textContent = response.incognito_tabs;
        inactive_tabs.textContent = response.inactive_tabs;
        windows.textContent = response.windows;
        incognito_windows.textContent = response.incognito_windows;
        current_window_tabs.textContent = response.current_window_tabs;
        bookmarks.textContent = response.bookmarks;

        // Update Tab Age
        const data = await getCurrentTabTimeData()
        // chrome.runtime.sendMessage({ action: "log", log: "other", data: await getCurrentTabTimeData()})

        tab_age.textContent = data.created;
    });


    // load color button colors
    (() => {
        chrome.storage.sync.get(['badgeTextColor', 'badgeBgColor'], (res) => {
            if (res.badgeTextColor) badgeTextColor.value = res.badgeTextColor;
            if (res.badgeBgColor) badgeBgColor.value = res.badgeBgColor;
        });
    })();


    // -- --
    badgeTextColor.addEventListener('input', () => {
        const newColor = badgeTextColor.value;
        chrome.runtime.sendMessage({ action: "updateSettings", type: "badgeText", color: newColor });
        chrome.storage.sync.set({ badgeTextColor: newColor });
    });

    badgeBgColor.addEventListener('input', () => {
        const newColor = badgeBgColor.value;
        chrome.runtime.sendMessage({ action: "updateSettings", type: "badgeBg", color: newColor });
        chrome.storage.sync.set({ badgeBgColor: newColor });
    });


    // -- --
    //
    back_button.addEventListener('click', () => {
        settings_page.style.display = 'none';
        main_page.style.display = 'block';
        // back_button.display = 'none'
    });
    // 
    settings_button.addEventListener('click', () => {
        settings_page.style.display = 'block';
        main_page.style.display = 'none';
        // settings_button.display = 'none'
    });
});



// ******************
// *** Functions ***


/**
 * 
 * @returns 
 */
async function getCurrentTabTimeData() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const result = await chrome.storage.local.get(`age_${tab.id}`);
    const startTime = result[`age_${tab.id}`];

    if (!startTime) return {
        "created": "unknown",
        "last-accessed": "unknown"
    };

    // chrome.runtime.sendMessage({action: "log", log: "something", data: toReadableString(tab.lastAccessed)})
    // chrome.runtime.sendMessage({ action: "log", log: "last accessed", data: tab.id });
    return {
        "created": toReadableString(startTime),
        "last-accessed": toReadableString(tab.lastAccessed)
    };
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
