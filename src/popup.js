

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
    const tab_age = document.querySelector("#tab_age strong")
    // const tab_last_accessed = document.querySelector('#tab_last_accessed strong')


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
        tab_age.textContent = data.created;
        // tab_last_accessed.textContent = data.last_accessed
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
        "last_accessed": "unknown"
    };

    return {
        "created": toReadableString(startTime),
        "last_accessed": toReadableString(tab.lastAccessed)
    };
}

/**
 * 
 * @param {*} startTime 
 * @returns 
 */
function toReadableString(startTime) {
    const tabAgeMs = Date.now() - startTime

    const totalSecs = Math.floor(tabAgeMs / 1000);
    const totalMins = Math.floor(totalSecs / 60);
    const totalHours = Math.floor(totalMins / 60);
    const totalDays = Math.floor(totalHours / 24);

    // remaining time
    const mins = totalMins % 60;
    const hours = totalHours % 24;
    const days = totalDays;

    const plural = (val, unit) => `${val} ${unit}${val !== 1 ? 's' : ''}`;

    // return first two
    if (days > 0)
        return `${plural(days, 'day')}, ${plural(hours, 'hr')} ago`
    else if (hours > 0)
        return `${plural(hours, 'hr')}, ${plural(mins, 'min')} ago`
    else
        return `${plural(mins, 'min')} ago`
}
