var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var tap = require('tap');

var OUT_ROOT = path.resolve(__dirname, '../test_output');

tap.test('polysphere', {timeout: 1000 * 100, skip: false }, function (suite) {

    var icor = require('./../index.js');

    var poly = new icor.Polysphere(300, 200, [
        {ro: 0, uv: { x: 0, y: 0}, color: [0, 0, 255]},
        {ro: 1, uv: {x: 0.5, y: 0}, color: [255, 0, 0]},
        {ro: 2, uv: {x: 0, y: 0.5}, color: [0, 255, 0]}
    ]);

    var t = new icor.Triangle(poly.vertices.slice(0, 3), poly, true);

    suite.test('triangle', {timeout: 1000 * 10, skip: false }, function (t_test) {

        var center = t.center(true);

        t_test.equal(center.x, 50, 'center x');
        t_test.equal(center.y, 33.33333333333333, 'center y');

        var frags = _.sortBy(t.frag(), function (p) {
            return p.x * 10000 + p.y
        });

        //  console.log('.... frags', util.inspect(frags));
        t_test.deepEqual(frags,
            [
                [ 0,
                    { x: 0, y: 0 },
                    { x: 75, y: 0 },
                    { x: 50, y: 33.33333333333333 } ],
                [ 0,
                    { x: 0, y: 0 },
                    { x: 0, y: 50 },
                    { x: 50, y: 33.33333333333333 } ],
                [ 1,
                    { x: 150, y: 0 },
                    { x: 75, y: 0 },
                    { x: 50, y: 33.33333333333333 } ],
                [ 1,
                    { x: 150, y: 0 },
                    { x: 75, y: 50 },
                    { x: 50, y: 33.33333333333333 } ],
                [ 2,
                    { x: 0, y: 100 },
                    { x: 0, y: 50 },
                    { x: 50, y: 33.33333333333333 } ],
                [ 2,
                    { x: 0, y: 100 },
                    { x: 75, y: 50 },
                    { x: 50, y: 33.33333333333333 } ]
            ]

        );

        t_test.end();
    });

    suite.test('render_poly', {timeout: 1000 * 10, skip: false }, function (r_test) {

        icor.render_poly(poly, [
            [0, 1, 2]
        ], function (err, canvas) {
            icor.canvas_to_file(canvas, path.resolve(OUT_ROOT, 'simple_triangles.png'), function () {
                r_test.end();
            });

        });
    });

    suite.test('render_planet 0', {timeout: 1000 * 10, skip: false}, function (pl_test) {

        var points = require('./../test_input/planet_0_points.json');
        var faces = require('./../test_input/planet_0_faces.json');

        function _c() {
            return Math.floor(Math.random() * 255);
        }

        points.points.forEach(function (point) {

            point.color = [_c(), _c(), _c()];

        })

        var planet = new icor.Polysphere(300, 200, points.points);

        icor.render_poly(planet, faces.faces, function (err, canvas) {
            icor.canvas_to_file(canvas, path.resolve(OUT_ROOT, 'planet_0_faces.png'), function () {
                pl_test.end();
            });
        })
    });

    suite.test('render_planet 1', {timeout: 1000 * 10, skip: false}, function (pl_test) {

        var points = require('./../test_input/planet_1_points.json');
        var faces = require('./../test_input/planet_1_faces.json');

        function _c() {
            return Math.floor(Math.random() * 255);
        }

        points.points.forEach(function (point) {

            point.color = [_c(), _c(), _c()];

        })

        var planet = new icor.Polysphere(300, 200, points.points);

        icor.render_poly(planet, faces.faces, function (err, canvas) {
            icor.canvas_to_file(canvas, path.resolve(OUT_ROOT, 'planet_1_faces.png'), function () {
                pl_test.end();
            });
        })
    });

    suite.test('render sectors 3', {timeout: 1000 * 10, skip: false}, function (pl_test) {

        var points = require('./../test_input/planet_3_points.json');
        var faces = require('./../test_input/planet_3_faces.json');





        function _c() {
            return Math.floor(Math.random() * 255);
        }

        var sector_colors = _.range(0, 20).map(function (s) {
            return  [_c(), _c(), _c()];
        });

        function _sectors_color(point) {
            var weight = 1/point.s.length;
            var color = point.s.reduce(function (out, sector) {

                var add = sector_colors[sector];
                return out.map(function(channel, c){
                    return channel + add[c] * weight;
                })

            }, [0,0,0]);
            return color.map(function (value) {
                return value / point.s.length;
            }).map(Math.floor);
        }

        points.points.forEach(function (point) {
            point.color = _sectors_color(point);
        });

        var planet = new icor.Polysphere(4000, 2000, points.points);

        icor.render_poly(planet, faces.faces, function (err, canvas) {
            var ctx = canvas.getContext('2d');
            points.points.forEach(function(point){
                var x = planet.width * point.uv[0];
                var y = planet.height * point.uv[1];
                ctx.textAlign = 'left';
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '10px Arial';
               // console.log(JSON.stringify(point));
                ctx.fillText(point.s.join(' '), x, y);
                ctx.fillStyle = '#660099';
                ctx.fillText(util.format('r %s g %s b %s', point.color[0], point.color[1], point.color[2]), x, y + 12);

                ctx.textAlign = 'right';
                ctx.fillStyle='#000000';
                ctx.fillText(point.ro, x, y);
            });

            icor.canvas_to_file(canvas, path.resolve(OUT_ROOT, 'planet_3_sectors.png'), function () {
                pl_test.end();
            });
        })
    });

    suite.test('render sectors 6', {timeout: 1000 * 1000, skip: false}, function (pl_test) {

        var points = require('./../test_input/planet_6_points.json');
        var faces = require('./../test_input/planet_6_faces.json');

        function _c() {
            return Math.floor(Math.random() * 266);
        }

        var sector_colors = _.range(0, 20).map(function (s) {
            return  [_c(), _c(), _c()];
        });

        function _sectors_color(point) {
            var weight = 1/point.s.length;
            var color = point.s.reduce(function (out, sector) {

                var add = sector_colors[sector];
                return out.map(function(channel, c){
                    return channel + add[c] * weight;
                })

            }, [0,0,0]);
            return color.map(function (value) {
                return value / point.s.length;
            }).map(Math.floor);
        }

        points.points.forEach(function (point) {
            point.color = _sectors_color(point);
        });

        var planet = new icor.Polysphere(4000, 2000, points.points);

        icor.render_poly(planet, faces.faces, function (err, canvas) {
      /*      var ctx = canvas.getContext('2d');
            points.points.forEach(function(point){
                var x = planet.width * point.uv[0];
                var y = planet.height * point.uv[1];
                ctx.textAlign = 'left';
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '10px Arial';
                console.log(JSON.stringify(point));
                ctx.fillText(point.s.join(' '), x, y);
                ctx.fillStyle = '#660099';
                ctx.fillText(util.format('r %s g %s b %s', point.color[0], point.color[1], point.color[2]), x, y + 12);

                ctx.textAlign = 'right';
                ctx.fillStyle='#000000';
                ctx.fillText(point.ro, x, y);
            });*/

            icor.canvas_to_file(canvas, path.resolve(OUT_ROOT, 'planet_6_sectors.png'), function () {
                pl_test.end();
            });
        })
    });

    suite.test('cache_planet 1', {timeout: 1000 * 10, skip: false}, function (pl_test) {

        var points = require('./../test_input/planet_1_points.json');
        var faces = require('./../test_input/planet_1_faces.json');

        function _c() {
            return Math.floor(Math.random() * 255);
        }

        points.points.forEach(function (point) {
            point.color = [_c(), _c(), _c()];
        });

        var planet = new icor.Polysphere(300, 200, points.points);

        planet.cache_triangles(path.resolve(__dirname, '../test_output/planet_1_300_200.json'),
            function () {
                pl_test.end();
            }, faces);
    });

    suite.end();

});