var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var tap = require('tap');

var OUT_ROOT = path.resolve(__dirname, '../test_output');

tap.test('polysphere', {timeout: 1000 * 10, skip: false }, function (suite) {

    var icor = require('./../index.js');

    var poly = new icor.Polysphere(300, 200, [
        {ro: 0, uv: { x: 0, y: 0}, color: [0, 0, 255]},
        {ro: 1, uv: {x: 1, y: 0}, color: [255, 0, 0]},
        {ro: 2, uv: {x: 0, y: 1}, color: [0, 255, 0]}
    ]);

    var t = new icor.Triangle(poly.vertices.slice(0, 3), poly);

    suite.test('triangle', {timeout: 1000 * 10, skip: false }, function (t_test) {

        var center = t.center(true);

        t_test.equal(center.x, 100, 'center x');
        t_test.equal(center.y, 66.66666666666666, 'center y');

        var frags = _.sortBy(t.frag(), function (p) {
            return p.x * 10000 + p.y
        });

        console.log('.... frags', util.inspect(frags));
        t_test.deepEqual(frags, [ [ 0,
            { x: 0, y: 0 },
            { x: 150, y: 0 },
            { x: 100, y: 66.66666666666666 } ],
            [ 0,
                { x: 0, y: 0 },
                { x: 0, y: 100 },
                { x: 100, y: 66.66666666666666 } ],
            [ 1,
                { x: 300, y: 0 },
                { x: 150, y: 0 },
                { x: 100, y: 66.66666666666666 } ],
            [ 1,
                { x: 300, y: 0 },
                { x: 150, y: 100 },
                { x: 100, y: 66.66666666666666 } ],
            [ 2,
                { x: 0, y: 200 },
                { x: 0, y: 100 },
                { x: 100, y: 66.66666666666666 } ],
            [ 2,
                { x: 0, y: 200 },
                { x: 150, y: 100 },
                { x: 100, y: 66.66666666666666 } ] ]);

        t_test.end();
    });

    suite.test('render_poly', {timeout: 1000 * 10, skip: false }, function (r_test) {
        icor.render_poly(poly, [[0, 1, 2]], function(err, canvas){
            icor.canvas_to_file(canvas, path.resolve(OUT_ROOT, 'simple_triangles.png') , function(){
                r_test.end();
            });

        });
    });

    suite.test('render_planet 0', {timeout: 1000 * 10, skip: false}, function(pl_test){

        var points = require('./../test_input/planet_0_points.json');
        var faces = require('./../test_input/planet_0_faces.json');

        function _c(){
            return Math.floor(Math.random() * 255);
        }

        points.points.forEach(function(point){

            point.color = [_c(), _c(), _c()];

        })

        var planet = new icor.Polysphere(300, 200, points.points);

        icor.render_poly(planet, faces.faces, function(err, canvas){
            icor.canvas_to_file(canvas, path.resolve(OUT_ROOT, 'planet_0_faces.png') , function(){
                pl_test.end();
            });
        })
    });

    suite.test('render_planet 1', {timeout: 1000 * 10, skip: false}, function(pl_test){

        var points = require('./../test_input/planet_1_points.json');
        var faces = require('./../test_input/planet_1_faces.json');

        function _c(){
            return Math.floor(Math.random() * 255);
        }

        points.points.forEach(function(point){

            point.color = [_c(), _c(), _c()];

        })

        var planet = new icor.Polysphere(300, 200, points.points);

        icor.render_poly(planet, faces.faces, function(err, canvas){
            icor.canvas_to_file(canvas, path.resolve(OUT_ROOT, 'planet_1_faces.png') , function(){
                pl_test.end();
            });
        })
    });

    suite.end();

});