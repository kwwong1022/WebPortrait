const historyAnalysisContainer = document.querySelector("#history-analysis-container");

let result = [];

// check if history queue is empty
setTimeout(async () => {
    chrome.storage.local.get(['historyQueue'], function(data) { 
        // if not empty, get history queue : save instance
        if (data.historyQueue && !data.historyQueue.isEmpty) {
            // analysis each history
            data.historyQueue.queue.forEach(history => {
                // get html content by url
                if (history.url != "chrome://newtab/") {
                    fetch(`https://kwwdev.com/api-test/html-fetching?url=${history.url}`)  // fetching html api created by myself
                    .then(res => res.text())
                    .then(htmlContent => {
                        let result = getAnalyzed(history.url, htmlContent);
                        historyAnalysisContainer.innerHTML = "";
                        alert(`result: { type: ${result.type}, emotion: { happy: ${result.emotion.happy}, sad: ${result.emotion.sad}, anger: ${result.emotion.anger}, surprise: ${result.emotion.surprise}, fear: ${result.emotion.fear}, neutral: ${result.emotion.neutral} } }`);

                        // get screenchot : puppeteer api - 800px * 600px
                        // https://asia-east2-kwwong1022-329215.cloudfunctions.net/getScreenshot?url=https://github.com/explore

                        // data structure to store analyzed data
                    });
                }
            })
        }
    });

    // clear historyQueue.queue
    // chrome.storage.local.remove(['historyQueue'], function(){})
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
    //alert(`${hostname}: type: ${result.type}`);

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

// load history cards based on user setting
// append new analyzed data -> script var
// append new analyzed data to local storage
// analyzedData: { url, analyzed:{cats:%}, screenshot }




// generate data portrait
// var: update frequency ?
// chrome.storage.sync: lastUpdated
// check undefined || is expired
// if so, generate
// ========== generate: p5js ==========
// save result to local storage