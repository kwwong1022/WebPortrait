/**  x : type
 *   | () (============)
 *   | () (=====)
 *   | () (=================)
 *   | () (===========================)
 *   | () (========)
 *   | () (=====)
 *   | () (=)
 *   __________________________________________ y = fequency
 */

menuTrendSketch = (s) => {
    const tc = [s.color(56, 148, 209), s.color(166, 36, 112), s.color(50, 199, 55), s.color(199, 147, 50), s.color(179, 50, 199), s.color(199, 104, 50), s.color(173, 173, 173)]

    let sampleNum = 120;
    let maxFrequency = -1;  // get this at the end
    let hists = [0, 0, 0, 0, 0, 0, 0];  // {type: fequency}

    let hd = [0, 0, 0, 0, 0, 0, 0], hdd = [100, 100, 100, 100, 100, 100, 100];

    s.setup = function() {
        s.createCanvas(document.querySelector('#menu-trend-s').clientWidth, document.querySelector('#menu-trend-s').clientHeight);
        s.noStroke();
        hd.forEach(wd => { wd = s.height/7*.8+10 });
        // load data based on sample - recent to past
        chrome.storage.local.get(['analyzedData'], function(result) {
            let analyzed = result.analyzedData;
            chrome.storage.sync.get("sampleImage", ({ sampleImage }) => {if (sampleImage) sampleNum = sampleImage});

            if (analyzed) {
                analyzed = result.analyzedData.analyzedHistory;

                // recent to latest
                let sample = 0;
                let latest = analyzed.length-1;

                for (let i=latest; i>=0; i--) {
                    // each analyzed history
                    let temp = analyzed[i].analyzed.type;
                    s.text(temp, 0, s.height/2);

                    switch (temp) {
                        case "entertainment":  // entertainment
                            hists[0]++;
                            break;
                        case "social":         // social
                            hists[1]++;
                            break;
                        case "education":      // education
                            hists[2]++;
                            break;
                        case "finance":        // finance
                            hists[3]++;
                            break;
                        case "shopping":       // shopping
                            hists[4]++;
                            break;
                        case "politics":       // politics
                            hists[5]++;
                            break;
                        default:               // other
                            hists[6]++;
                            break;
                    }

                    if (i==0 || sample > sampleNum) {
                        hists.forEach(h => { if (h > maxFrequency) maxFrequency = h });
                        hists.forEach((h, i) => { 
                            hdd[i] = s.map(h, 0, maxFrequency, hd[i], 250);
                        });
                        break;
                    }

                    sample++;
                }
            }
        });
    }
    
    s.draw = function() {
        s.background(255);

        // rows: 7
        // for each type
        hists.forEach((hist, y) => {
            let h = s.height/7;
            // draw indicator
            s.fill(tc[y]);
            s.rectMode(s.CORNER);
            s.rect(5, y*h, h*.6, h*.6, h*.3);
            // calc y distance, draw on canvas
            s.rect(h*.8+10, y*h, hd[y], h*.6, h*.3);

            // show info on hover : type - frequency
            if (s.mouseX>0 && s.mouseX<s.width && s.mouseY>y*h && s.mouseY<y*h+h) {
                s.rectMode(s.CENTER);
                s.textAlign(s.CENTER);
                s.fill(225);
                //s.rect(s.width/2-65, s.height/2-15, 140, 30);
                s.rect(s.width/2, s.height/2, 200, 30);
                let type = "";
                switch (y) {
                    case 0:
                        type = "entertainment";
                        break;
                    case 1:
                        type = "social";
                        break;
                    case 2:
                        type = "education";
                        break;
                    case 3:
                        type = "finance";
                        break;
                    case 4:
                        type = "shopping";
                        break;
                    case 5:
                        type = "politics";
                        break;
                    case 6:
                        type = "other";
                        break;
                }
                s.fill(0);
                s.text(`Type: ${type}, Frequency: ${hists[y]}`, s.width/2, s.height/2+4);
            }

            // lerp hd to hdd
            hd[y] = s.lerp(hd[y], hdd[y], .05);
        });
    }

    // s.windowResized = function() {}
}

var menuTrendP5 = new p5(menuTrendSketch, 'menu-trend-s');