var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var Canvas = require('canvas');
/* ------------ CLOSURE --------------- */

var _c = _.template('rgb(<%= r %>,<%= g %>,<%= b %>)');

function _color(color) {
    if (_.isString(color)) {
        console.log('returning string color %s', color);
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

function render_poly(poly, faces, callback, cache_file) {
    var exists = false;
    var cache_data = [];
    if (cache_file) {

        exists = fs.existsSync(cache_file);

        if (exists) {
            cache_data = require(cache_file);
        }
    }

    console.log('cache_file: %s, exists: %s, cache_data: %s', cache_file, exists, util.inspect(cache_data).substr(0, 100));
    var canvas = new Canvas(poly.width, poly.height);

    if (_.isFunction(faces)) {
        if (poly.faces.length) {
            callback = faces;
            faces = poly.faces;
        } else {
            throw new Error('defaced');
        }
    }

    if (!faces) {
        if (poly.faces) {
            faces = poly.faces;
        } else {
            throw new Error('cannot find faces');
        }
    }
    if (!faces.length){
        throw new Error('no faces');
    }
    console.log('faces: %s', faces.length);

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

    if (exists) {

    } else {
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
    }

    process.nextTick(function () {


        var facet_data = [];

        if (!exists) {

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
                if (cache_file) cache_data[order] = points;
                facet_data.push({color: colors[order], points: points});
            });
        } else {
            console.log('putting cache_data into facet data');
            facet_data = cache_data.map(function(points, order){
                return {
                    color: colors[order],
                    points: points
                }
            })
        }

        console.log('facet_data: %s', util.inspect(facet_data, false, 5).substr(0, 300));
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
            ctx.fill();
        });

        if (cache_file && (!exists)){
            fs.writeFile(cache_file, JSON.stringify(cache_data), function(){
                callback(null, canvas);
            });
        } else {
            callback(null, canvas);
        }

    })
}

/* -------------- EXPORT --------------- */

module.exports = render_poly;