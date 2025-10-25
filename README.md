# Browser data extension (BrD-ext/)
Browser extension to get relevant data and insights into browsing environment like tab counts with a helpful display using extension badges and a popup. It focuses on helping you visualize and manage digital distractions.

It provides data like how long a tab has been open so you know what to *bookmark* or delete

<!-- popup UI image for show -->

## Tech stack
- **Core:** JavaScript (ES6+), HTML5, CSS3
- **APIs:** Chrome Extension API (Manifest V3)

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
Since this extension is currently in development, you can load it locally:

### For personal use 
1. Go to the latest release and download the zip
2. unzip the file and store in a secure folder
3. Navigate to [chrome://extensions](chrome://extensions) | [edge://extensions](edge://extensions) and enable developer mode (switch in the top right corner).
3. Click `Load unpacked` and select the extension folder.

![Chrome extensions page](./browser-data/img/chrome-extensions-page.png)

### For development
1. **Clone the repository:**
   ```bash
   git clone https://github.com/egbaiyelo/BrD-ext.git
   ```
2. Navigate to [chrome://extensions](chrome://extensions) | [edge://extensions](edge://extensions) and enable developer mode (switch in the top right corner).
3. Click `Load unpacked` and select the src folder from the repo.



## Architecture
<!-- It uses background scripts... -->

## Future updates
- Open to more browsers
- Bookmark folder breakdown
- Tab grouping insights -> (each group and number of tabs) ?
- Fix colouring


## Reasoning
The extension is an effort to understand chrome apis and cross browser functionality by using other contexts.

I also wish to maybe publish it and get a little manageable application on the market to watch it and handle its real-world management and testing.