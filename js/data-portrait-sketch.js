// generate data portrait
// var: update frequency ?
// chrome.storage.sync: lastUpdated
// check undefined || is expired
// if so, generate

// ========== generate: p5js ==========
// save result to local storage

dataPortraitSketch = (s) => {
    class Hist {
        constructor(url, analyzed, img) {
            this.url = url;
            this.type = analyzed.type;
            this.emotion = analyzed.emotion;
            this.image = img;
            this.x = 0;
            this.y = 0;
        }
    }

    let hists = [];  // history objs

    // user settings
    let name = "", userGender = "private", sampleNum = 120, reuseSampleImg = true;

    s.preload = function() {
        // load history from local storage
        chrome.storage.local.get(['analyzedData'], function(result) {
            let analyzed = result.analyzedData;

            // load user settings
            chrome.storage.sync.get("username", ({ username }) => {if (username) name = username});
            chrome.storage.sync.get("gender", ({ gender }) => {if (gender) userGender = gender});
            chrome.storage.sync.get("sampleImage", ({ sampleImage }) => {if (sampleImage) sampleNum = sampleImage});
            chrome.storage.sync.get("reuseSample", ({ reuseSample }) => {if (reuseSample) reuseSampleImg = reuseSample});
            console.log(`user settings \nname: ${name}, \ngender: ${userGender}, \nsample num: ${sampleNum}, \nreuseSampleImg: ${reuseSampleImg}`);
            
            if (analyzed) {
                analyzed = result.analyzedData.analyzedHistory;

                // recent to old - below WRONG
                analyzed.forEach((history, i) => {
                    // load data based on user's sample number setting : hists[]
                    if (i < sampleNum) {
                        // load image through api
                        let img = s.loadImage(history.imgURL);
                        console.log(`sketch: imgURL - ${history.imgURL}`);
                        console.log(img);

                        hists.push(new Hist(history.url, history.analyzed, img));
                    }
                })
            }
        })

        
    }

    s.setup = function() {
        s.createCanvas(document.querySelector('#data-portrait-s').clientWidth, document.querySelector('#data-portrait-s').clientHeight);
        // hists.forEach(hist => {
        //     s.image(img, 0, 0);
        // })
    }

    s.draw = function() {
        //s.background(200);
        s.image(hists[hists.length-1].image, 0, 0);
        
    }

    // s.windowResized = function() {}
}

var dataPortraitP5 = new p5(dataPortraitSketch, 'data-portrait-s');