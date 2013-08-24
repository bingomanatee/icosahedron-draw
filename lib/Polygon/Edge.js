var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');

var _id = 0;

function Poly_Edge(poly, p1, p2) {
    if (!(_.isObject(p1)) && (_.isObject(p2))){
        throw new Error('bad args: %s, %s', util.inspect(p1), util.inspect(p2));
    }
    if (!(arguments.length == 3)) {
        throw new Error('3 args required');
    }
    if (!poly._point) {
        throw new Error('no _point in poly');
    }
    this.poly = poly;
    p1 = poly._point(p1);
    p2 = poly._point(p2);
    this.points = _.sortBy([p1, p2], 'order');
    this.id = ++_id;
}

Poly_Edge.prototype = {
    toString: function(){
        return util.format('[%s, %s]', this.points[0].order, this.points[1].order);
    },

    linked: function(edge){
      return _.intersection(this.orders(), edge.orders()).length == 1;
    },

    same: function (edge) {
        return edge.points[0].order == this.points[0].order && edge.points[1].order == this.points[1].order;
    },

    orders: function(){
        return [this.points[0].order, this.points[1].order];
    }
};

module.exports = Poly_Edge;