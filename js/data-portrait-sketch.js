// ========== generate: p5js ==========

dataPortraitSketch = (s) => {
    const GRID_WIDTH = 80, GRID_HEIGHT = 60;
    class Hist {
        constructor(url, analyzed, img) {
            this.url = url;
            this.type = analyzed.type;
            this.emotion = analyzed.emotion;
            this.image = img;
            this.val = 255;
            this.repeated = false;
        }
    }

    let dataReady = false;
    let hists = [];  // history objs

    // user settings
    let name = "", userGender = "private", sampleNum = 120, reuseSampleImg = false;
    let faceImg, dataPortrait;

    s.preload = function() {
        // load history from local storage
        chrome.storage.local.get(['analyzedData'], function(result) {
            let analyzed = result.analyzedData;

            // load user settings
            chrome.storage.sync.get("username", ({ username }) => {if (username) name = username});
            chrome.storage.sync.get("gender", ({ gender }) => {if (gender) {
                userGender = gender;
                // load face img based on user settings : female | male
                // if gender is private
                if (userGender == 'private') {
                    let gender = s.random()>.5? "male" : "female";
                    userGender = gender;
                    console.log(`gender: ${userGender}`);
                }
                // load face based on gender
                let faceNo = Math.floor(s.random(3))+1;
                console.log(`faceNo: ${faceNo}`);
                let imgUrl = `./images/face-image/${userGender}/face-${faceNo}.png`;
                faceImg = s.loadImage(imgUrl);
            }});
            chrome.storage.sync.get("sampleImage", ({ sampleImage }) => {if (sampleImage) sampleNum = sampleImage});
            chrome.storage.sync.get("reuseSample", ({ reuseSample }) => {if (reuseSample) reuseSampleImg = reuseSample});
            console.log(`user settings \nname: ${name}, \ngender: ${userGender}, \nsample num: ${sampleNum}, \nreuseSampleImg: ${reuseSampleImg}`);
            
            if (analyzed) {
                // recent to latest
                analyzed = result.analyzedData.analyzedHistory;
                let sample = 0;
                let latest = analyzed.length-1;

                for (let i=latest; i>=0; i--) {
                    let history = analyzed[i];
                    // load data based on user's sample number setting : hists[]
                    // load image through api
                    let img = s.loadImage(history.imgURL);
                    hists.push(new Hist(history.url, history.analyzed, img));

                    // last
                    if (i==0 || sample > sampleNum) { 
                        dataReady = true;
                        break; 
                    }
                    sample++;
                }
            }
        })
    }

    // processing
    let grids = [];

    s.setup = function() {
        s.createCanvas(document.querySelector('#data-portrait-s').clientWidth, document.querySelector('#data-portrait-s').clientHeight);
        s.frameRate(1);
        // color mode, image mode
        s.noStroke();
    }

    s.draw = function() {
        //s.background(255);
        if (dataReady && grids.length==0) {
            // process img val for each img in hists[]
            hists.forEach((hist, i) => {
                let sampleGap = 2;
                let totalVal = 0;
                for (let y=0; y<GRID_HEIGHT; y+=sampleGap) {
                    for (let x=0; x<GRID_WIDTH; x+=sampleGap) {
                        totalVal += s.brightness(hist.image.get(x, y));
                    }
                }
                hist.val = totalVal/(GRID_WIDTH/sampleGap*GRID_HEIGHT/sampleGap);
                console.log(`hist-${i}: ${hist.val}`);
            })

            if (faceImg && grids.length==0) {
                s.fill(255);
                s.rect(0, 0, s.width, s.height);
                // place face image in center
                s.image(faceImg, s.width/2-s.height/2, 0, s.height, s.height);
                // grid x, y
                for (let y=0; y<s.height; y+=GRID_HEIGHT) {
                    for (let x=0; x<s.width; x+=GRID_WIDTH) {
                        s.colorMode(s.RGB);
                        let g = { x: x, y: y, c: s.get(x, y), val: s.brightness(s.get(x, y)) };
                        // skip pixel scan canvas val
                        let samplePerGrid = 3;
                        // get num of cell => obj {x, y, imgVal, hist}
                        s.colorMode(s.HSB, 100, 100, 100, 1);
                        g.val = s.brightness(s.get(x, y));
                        grids.push(g);
                    }
                }
            }
            s.fill(255);
            s.rect(0, 0, s.width, s.height);
            // grid setup finished
            if (grids.length!=0) {
                // else : grid setup finished
                // - match each img val
                grids.forEach(g => {
                    s.colorMode(s.RGB);
                    s.fill(g.c);
                    s.rect(g.x, g.y, 80, 60);

                    // match grid img <=> hists[] img
                    let minDist = 9999;
                    let minHist = -1;
                    // unrepeated
                    hists.forEach((h, i) => {
                        let dist = Math.max(h.val, g.val) - Math.min(h.val, g.val)
                        if (dist < minDist && !h.repeated) {
                            minDist = dist;
                            minHist = i;
                        }
                    })
                    // assign hist to grids
                    if (!hists[minHist].repeated) {
                        g.hist = hists[minHist];
                        hists[minHist].repeated = true;
                    }
                    // **repeated
                    let repeatedNum = 0;
                    hists.forEach(h => { 
                        if (h.repeated) repeatedNum++; 
                        if (reuseSampleImg) repeatedNum = hists.length;
                    })
                    if (repeatedNum == hists.length) {
                        hists.forEach(h => { h.repeated = false; })
                    }

                    // place image
                    if (g.hist) {
                        s.tint(255, 150);
                        s.image(g.hist.image, g.x, g.y, GRID_WIDTH, GRID_HEIGHT);
                    }
                });

                // save processed data portrait : dataPortrait
                dataPortrait = s.createImage(s.width, s.height);
                for (let w=0; w<s.width; w++) {
                    for (let h=0; h<s.height; h++) {
                        dataPortrait.set(w, h, s.get(w, h));
                    }
                }
            }
        }

        if (dataReady && grids!=0) {
            // render portrait img;
            s.image(dataPortrait, 0, 0, s.width, s.height);

            grids.forEach(g => {
                // show info when hover
                if (s.mouseX>g.x && s.mouseX<g.x+GRID_WIDTH && s.mouseY>g.y && s.mouseY<g.y+GRID_HEIGHT) {
                    let offset = s.height - 160;
                    s.fill(200);
                    s.rect(10, 10+offset, 240, 140);
                    s.fill(255);
                    s.rect(15, 15+offset, 230, 130);
                    s.fill(0);
                    let { hostname } = new URL(g.hist.url);
                    s.text(`Website: ${hostname}\nType: ${g.hist.type}\nTendency:\n - happy: ${g.hist.emotion.happy}\n - sad: ${g.hist.emotion.sad}\n - anger: ${g.hist.emotion.anger}\n - surprise: ${g.hist.emotion.surprise}\n - fear: ${g.hist.emotion.fear}`, 20, 20+offset, 250, 300);
                }
            })
        }
    }
}

var dataPortraitP5 = new p5(dataPortraitSketch, 'data-portrait-s');