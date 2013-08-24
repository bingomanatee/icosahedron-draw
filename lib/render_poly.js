var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var Canvas = require('canvas');
/* ------------ CLOSURE --------------- */

var _c = _.template('rgb(<%= r %>,<%= g %>,<%= b %>)');

function _color(color) {
    if (_.isString(color)) {
        return color;
    }
    var r, g, b;
    if (_.isArray(color)) {
        r = color[0];
        g = color[1];
        b = color[2];
    } else {
        r = color.r;
        g = color.g;
        b = color.b;
    }

    return _c({r: r, b: b, g: g});
}

/** ********************
 * Purpose: to render a polygon to canvas
 * @return canvas
 */

function render_poly(poly, faces, callback) {
    var ico = require('./../index.js');

    var canvas = new Canvas(poly.width, poly.height);

    if (_.isFunction(faces)) {
        if (poly.faces.length) {
            callback = faces;
            faces = poly.faces;
        } else {
            throw new Error('defaced');
        }
    }

    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.rect(0, 0, poly.width, poly.height);
    ctx.fill();

    var colors = _.reduce(poly.vertices, function (out, point) {
        if (!point.color) {
            throw new Error('no color for point ' + util.inspect(point));
        }
        out[point.ro] = _color(point.color);
        return out;
    }, []);

    var triangles = [];

    poly.on('facet', function (order, a, b, c) {
        console.log('facet: order: %s, a: %s, b: %s, c: %s', order, util.inspect(a), util.inspect(b), util.inspect(c));

        if (!triangles[order]) {
            triangles[order] = [];
        }
        triangles[order].push(
            [ a, b, c]
        );
    });


    faces.forEach(function (face) {
        poly.emit('face', face);
    });

    process.nextTick(function () {

        triangles.forEach(function (points, order) {
            ctx.fillStyle = colors[order];
            ctx.beginPath();

            console.log('points: %s', util.inspect(points));
            points.forEach(function (point_list) {
                var f = point_list.shift();
                point_list.push(f);
                ctx.moveTo(f.x, f.y);
                point_list.forEach(function (pt) {
                    ctx.lineTo(pt.x, pt.y);
                });
            });

            ctx.closePath();
            ctx.fill();
        });
        callback(null, canvas);
    })
}

/* -------------- EXPORT --------------- */

module.exports = render_poly;