/**  x : fequency of browsing website
 *   |                      ||
 *   |  ||      ||      ||  ||          ||     color : web emotion tendency
 *   |  ||  ||  ||      ||  ||  ||  ||  ||           ** hover to see numbers & data
 *   |  ||  ||  ||  ||  ||  ||  ||  ||  ||    
 *    ________________________________________ y : date
 */

menuTrendSketch = (s) => {
    s.setup = function() {
        s.createCanvas(document.querySelector('#menu-trend-s').clientWidth+400, document.querySelector('#menu-trend-s').clientHeight+400);
    }
    
    s.draw = function() {
        s.background(0);
    }
}

var menuTrendP5 = new p5(menuTrendSketch, 'menu-trend-s');