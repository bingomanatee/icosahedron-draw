var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var draw_corner = require('./draw_corner');


/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: To draw a triangle onto a canvas
 * @return void
 */

function draw(ctx, h, w) {
    var t = this;

    draw_corner(t, ctx, 'a', h, w, 0, 0);
    draw_corner(t, ctx, 'b', h, w, 0, 0);
    draw_corner(t, ctx, 'c', h, w, 0, 0);

    var x = this.center().x;
    if (x > 0.95) {
        draw_corner(t, ctx, 'a', h, w, -1, 0);
        draw_corner(t, ctx, 'b', h, w, -1, 0);
        draw_corner(t, ctx, 'c', h, w, -1, 0);
    } else if (x < 0.05) {
        draw_corner(t, ctx, 'a', h, w, 1, 0);
        draw_corner(t, ctx, 'b', h, w, 1, 0);
        draw_corner(t, ctx, 'c', h, w, 1, 0);
    }
}

/* -------------- EXPORT --------------- */

module.exports = draw;