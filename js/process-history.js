const historyAnalysisContainer = document.querySelector("#history-analysis-container");

let tempAnalyzedData = { isEmpty: true, analyzedHistory: [] };
/** 
 * let tempAnalyzedData = {
 *     isEmpty: true,
 *     analyzedHistory: [
 *         {
 *             url: URL,
 *             analyzed: { type: "", emotion: { ... } },
 *             imgBlobURL: URL,
 *             date: int,
 *             month: int,
 *             year: int
 *         }
 *     ]
 * };
*/

// check if history queue is empty
setTimeout(async () => {
    chrome.storage.local.get(['historyQueue'], function(data) { 
        // if not empty, get history queue : save instance
        if (data.historyQueue && !data.historyQueue.isEmpty) {
            tempAnalyzedData.isEmpty = false;
            // analysis each history
            let lastQueue = data.historyQueue.queue.length-1;
            data.historyQueue.queue.forEach((history, i) => {
                // get html content by url
                if (history.url != "chrome://newtab/") {
                    // main function - hide for debugging
                    fetch(`https://kwwdev.com/api-test/html-fetching?url=${history.url}`)  // fetching html api created by myself
                    .then(res => res.text())
                    .then(htmlContent => {
                        let tempResult = getAnalyzed(history.url, htmlContent);
                        historyAnalysisContainer.innerHTML = "";

                        // get screenchot : puppeteer api - 800px * 600px
                        // https://asia-east2-kwwong1022-329215.cloudfunctions.net/getScreenshot | query: ?url
                        // fetch image
                        fetch("https://asia-east2-kwwong1022-329215.cloudfunctions.net/getScreenshot?url=https://github.com/explore")
                        .then(res => res.blob())
                        .then(imgBlob => {  // combo with : let url = URL.createObjectURL(images)
                            // create a local obj url for storing
                            const pageImgBlob = URL.createObjectURL(imgBlob);

                            // data structure to store analyzed data saved to tempAnalyzedData
                            let temp = {
                                url: history.url,
                                analyzed: tempResult,
                                imgBlobURL: pageImgBlob,
                                date: history.date,
                                month: history.month,
                                year: history.year
                            }

                            tempAnalyzedData.analyzedHistory.push(temp);
                            
                            // check is last history in queue
                            if (i==lastQueue) {
                                // if true - save all data to local storage  ======== unchecked =======
                                chrome.storage.local.get(['analyzedData'], function(result) {
                                    let analyzed = result.analyzedData;

                                    // if analyzedData == undefined -> create 
                                    if (!analyzed) {
                                        // init with current analyzed data
                                        let analyzedData = tempAnalyzedData;
                                        chrome.storage.local.set({ analyzedData }, function() {alert("analyzedData has been created")});

                                    } else {
                                        // append new analyzed data to analyzedHistory : combine array objects
                                        let oriArr = analyzed.analyzedHistory;
                                        let currArr = tempAnalyzedData.analyzedHistory;

                                        analyzed.analyzedHistory = oriArr.concat(currArr);
                                        let analyzedData = analyzed;
                                        chrome.storage.local.set({ analyzedData }, function() { alert("analyzedData has been updated") });
                                    }
                                })

                                // clear historyQueue.queue
                                // set historyQueue.queue to [], historyQueue.isEmpty to true
                                chrome.storage.local.set({ historyQueue: { 
                                    isEmpty: true, 
                                    queue: [] 
                                } }, function() {});

                                // load history to menu

                            }
                        })
                    });
                }
            })
        }
    });
}, 100);

let getAnalyzed = (url, htmlContent) => {
    let result = { emotion: { happy: 0, sad: 0, anger: 0, surprise: 0, fear: 0, neutral: 1  } };
    // url obj : get domain
    let { hostname } = new URL(url);
    // analyze web domain - web cats : entertainment, education, finance, shopping, politics, other
    let cats = Object.keys(typeSample);
    let catFound = false;
    for (let i=0; i<cats.length; i++) {
        if (!catFound) {
            typeSample[cats[i]].forEach(domainSample => {
                if (hostname.includes(domainSample)) {
                    catFound = true;
                    // save web type when match sample
                    result.type = cats[i];
                }
            })
        }
    }
    if (!catFound) result.type = 'other';

    // analyze words in html content
    let emos = Object.keys(emotionSample);
    historyAnalysisContainer.innerHTML = htmlContent;

    let paragraphs = Array.from(document.querySelectorAll('p'));
    paragraphs.forEach(p => {
        // check each emotion - emotion: [ words ]
        for (let i=0; i<emos.length; i++) {
            // check each words
            emotionSample[emos[i]].forEach(emoWord => {
                let sentence = p.innerText.toLocaleLowerCase();
                if (sentence.includes(emoWord)) {
                    switch (i) {
                        case 0:  // happy
                            result.emotion.happy += .5;
                            break;
                        case 1:  // sad
                            result.emotion.sad += .5;
                            break;
                        case 2:  // anger
                            result.emotion.anger += .5
                            break;
                        case 3:  // surprise
                            result.emotion.surprise += .5
                            break;
                        case 4:  // fear
                            result.emotion.fear += .5
                            break;
                    }
                }
            })
        }
    })
    
    return result;
}

// func load history cards based on user setting
let loadHistoryCard = () => {
    
}




// generate data portrait
// var: update frequency ?
// chrome.storage.sync: lastUpdated
// check undefined || is expired
// if so, generate
// ========== generate: p5js ==========
// save result to local storage