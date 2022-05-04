menuTrendSketch = (s) => {
    s.setup = function() {
        s.createCanvas(document.querySelector('#menu-trend-s').clientWidth, document.querySelector('#menu-trend-s').clientHeight);
        // chrome api test
        // chrome.storage.sync.get("agreementAccepted", ({ agreementAccepted }) => {
        // })
    }
    
    s.draw = function() {
        s.background(0);
    }
}

var menuTrendP5 = new p5(menuTrendSketch, 'menu-trend-s');