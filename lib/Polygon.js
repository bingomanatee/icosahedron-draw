var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;

var Point = require('./Polygon/Point.js');
var Shape = require('./Polygon/Shape.js');
var Edge = require('./Polygon/Edge.js');

function _e(e) {
    return util.format('%s ... %s', e[0].data, e[1].data);
}


function Poly() {
    this.points = [];
    this.edges = [];

    var last_pt, first_pt, last_edge;
    _.toArray(arguments).forEach(function (pt) {
        if (!first_pt) {
            first_pt = pt;
        }
        if (last_pt) {
            this.add_edge(this, last_pt, pt);
            last_edge = new Edge(first_pt, pt);
        }
    }, this);

    if (last_edge) this.edges.push(last_edge);
}

_.extend(Poly.prototype, {

    add_edge: function (p1, p2) {
        var edge;

        if (p1 instanceof(Edge)) {
            edge = p1;
        } else {
            p1 = this._point(p1);
            p2 = this._point(p2);
            edge = new Edge(this, p1, p2);
        }

        this.edges.push(edge);
    },

    has_edge: function (p1, p2) {
        var edge;
        if (p1 instanceof Edge) {
            edge = p1;
        } else {
            edge = new Edge(this, p1, p2);
        }

        return this.edges.some(function(some){
            some.same(edge);
        })
    },

    remove_edge: function(p1, p2){
        var edge;
        if (p1 instanceof Edge) {
            edge = p1;
        } else {
            edge = new Edge(this, p1, p2);
        }
      this.edges = _.reject(this.edges, function(some){
          return some.same(edge);
      })
    },

    _point: function (p) {
        var op = _.find(this.points, function (op) {
            return op.order == p.order
        });

        if (op) return op;

        var pt = new Point(p.order, p.x, p.y);
        this.points.push(pt);
        return pt;
    },

    linked_edges: function (edge) {
        if (!(edge instanceof Edge)) {
            throw new Error('bad parameter ' + util.inspect(edge));
        }
        var orders = edge.orders();
        var out = this.edges.filter(function (an_edge) {
            return (!edge.same(an_edge)) && an_edge.linked(edge);
        })
        return out;
    },

    shapes: function () {
        if (!this.edges.length) {
            return [];
        }
        var unused_edges = this.edges.slice();
        var out = [];

        while (unused_edges.length) {
            var shape = new Shape(this, unused_edges[0], unused_edges);
            if (shape.points.length > 2) {
                out.push(shape);
            }

            unused_edges = _.difference(unused_edges, shape.drawn_edges);
        }
        return out;
    }

});

module.exports = Poly;