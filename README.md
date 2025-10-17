# Browser data extension (BrD-ext/)
Browser extension to get relevant data and insights into browsing environment like tab counts with a helpful display using extension badges and a popup. It focuses on helping you visualize and manage digital distractions.

It provides data like how long a tab has been open so you know what to *bookmark* or delete

## What it shows
- Tab count -> Number of tabs ope across all windows
- Window count -> Number of windows open in browser
- Current window tabs count - Number of tabs in the current window
- Inactive tabs -> Number of inactive tabs
- Bookmarks -> Total number of saved bookmarks

<!-- 
    Inactive tab count
    Age of current tab, 
    current window pinned tabs 
-->

*If incognito access granted*
- Incognito tab count 
- Incognito window count

*Future*
- Gets most visited sites in a day 
- Gets time spent on current tab 
- Focus sessions/time spent on specific domains

## ⬇️ Installation
This isn't available on the extension store yet so,

1. Download the `Browser-data/src` folder, 
2. Go to [chrome://extensions](chrome://extensions) | [edge://extensions](edge://extensions) and go to developer mode. <!-- only for chrome but maybe edge and firefox too -->
3. Click `Load unpacked` and select the extension folder. <!-- Maybe add image? -->
4. Get insights on browser productivity data.

![Chrome extensions page](./browser-data/img/chrome-extensions-page.png)


## Future updates
- Open to more browsers
- Bookmark folder breakdown
- Tab grouping insights -> (each group and number of tabs, age)
- Fix colouring


## Reasoning
The extension is an effort to force myself to understand chrome apis and cross browser functionality by using other contexts.

I also wish to maybe publish it and get a little manageable application on the market to watch it and handle its real-world management and testing.