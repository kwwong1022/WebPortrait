const historyAnalysisContainer = document.querySelector("#history-analysis-container");
const screenchotContainer = document.querySelector("#screenshot-container");
const screenshotWidth = 80, screenshotHeight = 60;

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
    // load history to menu
    loadHistoryCard();

    if (isAgreementAccepted) {
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
                            fetch(`https://asia-east2-kwwong1022-329215.cloudfunctions.net/getScreenshot?url=${history.url}`)
                            .then(res => res.blob())
                            .then(imgBlob => {
                                // convert blob to jpeg image data url
                                createImageBitmap(imgBlob)
                                .then(imgBitmap => {
                                    let ctx = screenchotContainer.getContext("2d");
                                    ctx.drawImage(imgBitmap, 0, 0, screenshotWidth, screenshotHeight);
                                    let jpegFile = screenchotContainer.toDataURL("image/jpeg");

                                    //document.querySelector("#btn-setting img").src = jpegFile;
                                    // alert(jpegFile);

                                    // data structure to store analyzed data saved to tempAnalyzedData
                                    let temp = {
                                        url: history.url,
                                        analyzed: tempResult,
                                        imgURL: jpegFile,
                                        date: history.date,
                                        month: history.month,
                                        year: history.year
                                    }

                                    tempAnalyzedData.analyzedHistory.push(temp);
                                    
                                    // check is last history in queue
                                    if (i==lastQueue) {
                                        // if true - save all data to local storage
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
                                        loadHistoryCard();
                                    }
                                })
                            })
                        });
                    }
                })
            }
        });
    }
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
    let cardContainer = document.querySelector("#container-history .scrollable-content");
    // load analyzed data from local storage
    chrome.storage.local.get(['analyzedData'], function(result) {
        let analyzed = result.analyzedData;

        // if exist
        if (analyzed) {
            let maxHistoryResult = rangeMaxResult.value;
            analyzed = result.analyzedData.analyzedHistory;

            // To-Do: from reversed order - new -> old
            analyzed.forEach((history, i) => {
                if (i < maxHistoryResult) {
                    // create element
                    let card = document.createElement('a');
                    let cardIndicator = document.createElement('div');
                    let cardUrl = document.createElement('div');
                    card.classList.add('card-history');
                    cardIndicator.classList.add('indicator');
                    cardUrl.classList.add('url')
                    card.href = history.url;
                    cardUrl.innerText = history.url;

                    // change color based on type
                    let color = "rgb(173, 173, 173)";  // default: other
                    switch (history.analyzed.type) {
                        case "entertainment":
                            color = "rgb(56, 148, 209)";
                            break;
                        case "education":
                            color = "rgb(50, 199, 55)";
                            break;
                        case "finance":
                            color = "rgb(199, 147, 50)";
                            break;
                        case "shopping":
                            color = "rgb(179, 50, 199)";
                            break;
                        case "politics":
                            color = "rgb(199, 104, 50)";
                            break;
                    }
                    cardIndicator.style.backgroundColor = color;

                    // append to card container
                    card.appendChild(cardIndicator);
                    card.appendChild(cardUrl);
                    cardContainer.insertAdjacentElement('beforebegin', card);
                }
            });
        }
    })
}