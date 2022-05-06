// onInstalled
chrome.runtime.onInstalled.addListener(() => {
    console.log('Installation successfully completed!\nWeb Portrait extension\n- created by Wong Kai Fung');
});

// listen for http request update
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
        // get updated url -> save to queue -> analyze @process-history.js: analysis web, load screenshot of pages
        console.log(`url updates: ${changeInfo.url}, access date: ${(new Date()).getDate()}/${(new Date()).getMonth()}`);
        // data structure: chrome.storage.local - name: historyQueue
        // { isEmpty: bool, queue: array[...{url, dateAccess}] }

        chrome.storage.local.get(['historyQueue'], function(result) {
            let temp = result.historyQueue;
            // if history queue == undefined -> create 
            if (!temp) {
                console.log("history queue is empty");
                chrome.storage.local.set({ historyQueue: { 
                    isEmpty: false, 
                    queue: [{ url: changeInfo.url, 
                        date: (new Date()).getDate(), 
                        month: (new Date()).getMonth(), 
                        year: (new Date()).getFullYear() 
                    }] } }, function() {console.log("history queue has been created")});
                
            } else {
                temp.isEmpty = false;
                temp.queue.push({ 
                    url: changeInfo.url, 
                    date: (new Date()).getDate(), 
                    month: (new Date()).getMonth(), 
                    year: (new Date()).getFullYear()
                });
            }
            chrome.storage.local.set({ historyQueue: temp }, function() { console.log("history queue has been updated") });
        })
        chrome.storage.local.get(['historyQueue'], function(result) { console.log(result.historyQueue) });
    }
});