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
        }
    }

    let dataReady = false;
    let hists = [];  // history objs

    // user settings
    let name = "", userGender = "private", sampleNum = 120, reuseSampleImg = true;
    let faceImg;

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
            //s.image(hists[0].image, 0, 0);
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

            // num of rows : height / 60
            // num of cols : width / 80
            let nor = s.height/60;
            let noc = s.width/80;
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
                    // s.colorMode(s.HSB, 100, 100, 100, 1);
                    // s.fill(g.val);
                    s.colorMode(s.RGB);
                    s.fill(g.c);
                    s.rect(g.x, g.y, 80, 60);

                    // place image
                    s.image();
                });
            }
        }

        // match grid img <=> hists[] img
    }

    // s.windowResized = function() {}
}

var dataPortraitP5 = new p5(dataPortraitSketch, 'data-portrait-s');