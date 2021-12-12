function executeScript(id) {
    chrome.scripting.executeScript({
        target: { tabId: id },
        files: ['content-script.js']
    });
}

chrome.action.onClicked.addListener(
    (tab) => {
        console.log("clicked");
        executeScript(tab.id);
    }
);

chrome.webNavigation.onCompleted.addListener(
    (tab) => {
        executeScript(tab.tabId);
    },
    {
        url: [
            {
                hostContains: "youtube.com",
            }
        ]
    }
);

chrome.webNavigation.onHistoryStateUpdated.addListener(
    (tab) => {
        executeScript(tab.tabId);
    },
    {
        url: [
            {
                hostContains: "youtube.com",
            }
        ]
    }
);
