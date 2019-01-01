chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL('bookmarks.html') });
});

const getActiveTab = (fn) => {
    chrome.tabs.query({ active: true, currentWindow: true }, fn);
};

chrome.runtime.onMessage.addListener((request) => {
    switch (request.command) {
    case 'getBookmarks':
        getActiveTab((tabs) => {
            chrome.bookmarks.getTree(
                bookmarks => chrome.tabs.sendMessage(tabs[0].id, { type: 'getBookmarks', data: bookmarks[0] })
            );
        });
        break;
    case 'searchBookmarks':
        getActiveTab((tabs) => {
            chrome.bookmarks.getTree((bookmarks) => {
                chrome.bookmarks.search(
                    request.query,
                    result => chrome.tabs.sendMessage(tabs[0].id, { type: 'searchBookmarks', data: bookmarks[0], searchResults: result })
                );
            });
        });
        break;
    default:
        break;
    }
});
