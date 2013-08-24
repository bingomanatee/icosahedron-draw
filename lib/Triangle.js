`````````````````````var _ = require('underscore');
var util = require('util');

var _DEBUG = false;

/** ************************************
 * A triangle represents a facet of the sphere,
 * defined by UV coordinates.
 * ************************************ */

/* ******* CLOSURE ********* */

/**
 *
 * @param vertices [{number}]
 * @param poly {Polysphere}
 * @constructor
 */

function Triangle(vertices, poly) {

    this.vertices = vertices.map(function (vertex) {
        if(_.isNumber(vertex)){
           vertex = poly.vertices[vertex];
        };

        var out = {
            ro: vertex.ro
        };

        if (_.isArray(vertex.uv)) {
            out.uv = {x: vertex.uv[0], y: vertex.uv[1]};
        } else {
            out.uv = _.clone(vertex.uv);
        }

        return out;
    });

    this.poly = poly;

    this.a = _.extend({ro: this.vertices[0].ro}, this.vertices[0].uv);
    this.b = _.extend({ro: this.vertices[1].ro}, this.vertices[1].uv);
    this.c = _.extend({ro: this.vertices[2].ro}, this.vertices[2].uv);

//  var fix = require('./Triangle/fix');
//   fix(this);
}

var _t = _.template('Triangle (<%= a %>, <%= b %>, <%= c %>)');

Triangle.prototype = {

    color: require('./Triangle/color'),

    top_or_bottom: require('./Triangle/top_or_bottom'),

    draw: require('./Triangle/draw'),

    toString: function () {
        return _t(this);
    },

    clone: function () {
        return new Triangle(this.vertices, this.poly);
    },

    center: function (scale) {
        if (!this._c) this._c = {
            x: (this.a.x + this.b.x + this.c.x) / 3,
            y: (this.a.y + this.b.y + this.c.y) / 3
        }
        if (scale && (!this._cs)) {
            this._cs = this._pt(this._c);
        }
        return scale ? this._cs : this._c;
    },

    _pt: function (x, y) {
        if (_.isObject(x)) {
            y = x.y;
            x = x.x;
        }

        return {x: x * this.poly.width, y: y * this.poly.height};
    },

    point_fragment: function (from_point, to_point, k) {

        util.inspect('from point: %s', util.inspect(from_point));
        util.inspect('to point: %s', util.inspect(to_point));
        util.inspect('k %s', k);

        if (!this[ k]) {
            this[k] = this._pt((from_point.x + to_point.x) / 2, (from_point.y + to_point.y) / 2);
        }
        if (_.isUndefined(from_point.ro)){
            throw new Error('no ro');
        }
        var out = [from_point.ro, this._pt(from_point), this[k], this.center(true)];
        return out;
    },

    frag: function () {

        var pf = _.bind(function (args) {
            return this.point_fragment.apply(this, args);
        }, this);

        return [
            [this.a, this.b, 'ab'],
            [this.a, this.c, 'ac'],
            [this.b, this.a, 'ab'],
            [this.b, this.c, 'bc'],
            [this.c, this.a, 'ac'],
            [this.c, this.b, 'bc']
        ].map(pf);

    }

};

/* ********* EXPORTS ******** */

module.exports = Triangle;