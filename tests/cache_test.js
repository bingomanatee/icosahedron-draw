var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var tap = require('tap');

var ico = require('icosahedron');
var icor = require('./../index.js');
var OUT_ROOT = path.resolve(__dirname, '../test_output');

var CACHE_FILE_PATH = path.resolve(OUT_ROOT, 'cache_file.json');

/** ------------ CLOSURE ------------- */

var DETAIL = 4;
var uncached_file = path.resolve(OUT_ROOT, 'planet_' + DETAIL + '_sectors_uncached.png');
var cached_file = path.resolve(OUT_ROOT, 'planet_' + DETAIL + '_sectors_cached.png');

[CACHE_FILE_PATH, uncached_file, cached_file].forEach(function (f) {
    if (fs.existsSync(f)) fs.unlinkSync(f);
});

function _c() {
    return Math.floor(Math.random() * 266);
}

function _t(since) {
    if (since) {
        return new Date().getTime() - since;
    } else {
        return new Date().getTime();
    }
}

var sector_colors = _.range(0, 20).map(function (s) {
    return  [_c(), _c(), _c()];
});

function _sectors_color(point) {
    if (!point.s) {
        console.log('bad point: %s', util.inspect(point));
        throw new Error('bad point');
    }
    var weight = 1 / point.s.length;
    var color = point.s.reduce(function (out, sector) {

        var add = sector_colors[sector];
        return out.map(function (channel, c) {
            return channel + add[c] * weight;
        })

    }, [0, 0, 0]);
     color = color.map(function (value) {
        return value / point.s.length;
    }).map(Math.floor);

    return color;
}

tap.test('icosahedron render', {timeout: 1000 * 100, skip: false }, function (suite) {

    ico.io.points(function (err, points) {
        ico.io.faces(function (err, faces) {

            suite.test('uncache time', {timeout: 1000 * 100, skip: false }, function (uncache) {

                debugger;
                points.forEach(function (point) {
                    point.color = _sectors_color(point);
                });

                var t = _t();

                var planet = new icor.Polysphere(1000, 500, points);
                icor.render_poly(planet, faces, function (err, canvas) {
                    icor.canvas_to_file(canvas, uncached_file, function () {
                        var uncache_time = _t(t);

                        uncache.test('cache time ', {timeout: 1000 * 100, skip: false }, function (cache_test) {

                            var t_cache = _t();

                            points.forEach(function (point) {
                                point.color = _sectors_color(point);
                            });
                            console.log('points.length: %s', points.length);
                            var planet_cached = new icor.Polysphere(1000, 500, points);
                            icor.render_poly(planet_cached, faces, function (err, canvas) {
                                icor.canvas_to_file(canvas, cached_file, function () {
                                    var cache_time = _t(t_cache);
                                    console.log('cached_time: %s, uncached time: %s', cache_time, uncache_time);
                                    cache_test.end();
                                });
                            }, CACHE_FILE_PATH);

                        });
                        uncache.end();
                    });
                }, CACHE_FILE_PATH);

            }); // end uncache time test;

            suite.end();

        }, DETAIL); // end ico.io.faces
    }, DETAIL); // end ico.io.points

});