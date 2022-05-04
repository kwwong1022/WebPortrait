menuTrendSketch = (s) => {
    s.setup = function() {
        s.createCanvas(100, 100);
    }
    
    s.draw = function() {
        s.background(0);
    }
}

var menuTrendP5 = new p5(menuTrendSketch, 'menu-trend-s');