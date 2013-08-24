var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var tap = require('tap');

var _DEBUG = false;

var ico = require('./../index.js');

tap.test('ico-render', {timeout: 1000 * 10, skip: false }, function (suite) {

    suite.test('polygon', {timeout: 1000 * 10, skip: false }, function (poly_test) {


        poly_test.test('single polygon', function (st) {
            var poly = new ico.Polygon();

            if (_DEBUG) console.log('------- empty shape ...');
            var shapes = poly.shapes();
            st.equal(shapes.length, 0, 'no shapes');

            if (_DEBUG) console.log('-------- one edge shape ...');
            poly.add_edge({order: 0, x: 0, y: 0}, {order: 1, x: 100, y: 0});
            shapes = poly.shapes();
            st.equal(shapes.length, 0, 'still no shapes after one edge');

            if (_DEBUG) console.log('-------- two edge shape ...');
            poly.add_edge({order: 1, x: 100, y: 0}, {order: 2, x: 100, y: 100});
            shapes = poly.shapes();
            if (_DEBUG) console.log('second edge shapes: %s', shapes[0]);
            st.equal(shapes.length, 1, 'one shapes after second edge');

            if (_DEBUG) console.log('-------- three edge shape ...');
            poly.add_edge({order: 3, x: 0, y: 100}, {order: 2, x: 100, y: 100});
            shapes = poly.shapes();
            if (_DEBUG) console.log('third edge shapes: %s', shapes[0]);
            st.equal(shapes.length, 1, 'one shape');
            st.end();
        });

        poly_test.test('multi polygon', function (mt) {

            var p = _.range(0, 6).map(function (order) {
                return {order: order};
            });

            var poly = new ico.Polygon();
            poly.add_edge(p[0], p[1]);
            poly.add_edge(p[1], p[2]);
            poly.add_edge(p[2], p[0]);
            poly.add_edge(p[3], p[4]);
            poly.add_edge(p[4], p[5]);
            poly.add_edge(p[5], p[3]);

            var shapes = poly.shapes();
            mt.equal(shapes.length, 2, 'two shapes');

            var poly2 = new ico.Polygon();

            poly2.add_edge(p[0], p[1]);
            poly2.add_edge(p[1], p[2]);
            poly2.add_edge(p[2], p[3]);
            poly2.add_edge(p[3], p[4]);
            poly2.add_edge(p[4], p[5]);
            poly2.add_edge(p[5], p[3]);

            console.log('----------- poly 2 shapes --------------');
            var shapes2 = poly2.shapes();
            mt.equal(shapes2.length, 1, 'one shape for big poly');

            mt.end();

        });

        poly_test.end();
    });

    suite.end();

});