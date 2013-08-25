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

/**
 * renders a polygon.
 * @param faces [[{number} x3]]
 * @return {canvas}
 */

function render_poly(faces) {
    var poly = this;

    var canvas = new Canvas(poly.width, poly.height);
    if (!faces) faces = poly.faces;

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

    var facet_data = [];

    triangles.forEach(function (points, order) {

        var clones = [];

        points.forEach(function (list) {
            if (_.max(_.pluck(list, 'x')) > poly.width) {
                clones.push(list.map(function (pt) {
                    pt = _.clone(pt);
                    pt.x -= poly.width;
                    return pt;
                }))
            }
            if (_.min(_.pluck(list, 'x')) < 0) {
                clones.push(list.map(function (pt) {
                    pt = _.clone(pt);
                    pt.x += poly.width;
                    return pt;
                }))
            }
        });

        points = points.concat(clones);

        facet_data.push({color: colors[order], points: points.concat(clones)});

        poly.emit('draw_points', order, points);
    });

    facet_data.forEach(function (data) {

        ctx.fillStyle = ctx.strokeStyle = data.color;
        ctx.beginPath();

        data.points.forEach(function (point_list) {
            point_list = point_list.slice();
            var f = point_list.shift();
            point_list.push(f);
            ctx.moveTo(f.x, f.y);
            point_list.forEach(function (pt) {
                ctx.lineTo(pt.x, pt.y);
            });
        });

        ctx.closePath();
        ctx.stroke();
    });

    facet_data.forEach(function (data) {

        ctx.fillStyle = ctx.strokeStyle = data.color;
        ctx.beginPath();

        data.points.forEach(function (point_list) {
            point_list = point_list.slice();
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

    return canvas;
}

/* -------------- EXPORT --------------- */

module.exports = render_poly;