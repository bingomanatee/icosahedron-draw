var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: To color a triangle
 * @return void
 */

function color(corner) {
    var color = this.sphere.vertex_data(this.face[corner], 'color');

    if (_.isNumber(color)) {
        var c = new THREE.Color();
        var g = color;
        c.setRGB(color, color, color);
        color = c;
        // console.log('color: %s %s', g, color.getStyle());
    } else if (Array.isArray(color)) {
        color = new THREE.Color();
        color.setRGB(color[0], color[1], color[2]);
    }
    return color ? color.getStyle() : 'rgb(128,128,128)';
}

/* -------------- EXPORT --------------- */

module.exports = color;