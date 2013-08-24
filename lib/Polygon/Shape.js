var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');


/* ------------ CLOSURE --------------- */

var _DEBUG = true;

function _diff_pt(e1, e2){
    return _.find(e1.points, function(pt){
       return !_.contains(e2.orders(), pt.order);
    });
}

function _linked_edges(edge, pool){
    return pool.filter(function(pool_edge){
       return _.intersection(pool_edge.orders(), edge.orders()).length == 1;
    })
}

/**
 * represents a contiguous polygon
 * @param polygon {Polygon}
 * @param first_edge {Edge}
 * @param edge_pool [{Edge}]
 * @constructor
 */

function Shape(polygon, first_edge, edge_pool) {
    this.poly = polygon;
    this.points = first_edge.points.slice();
    var edge, last_edge = first_edge, done;
    this.drawn_edges = [first_edge];
    if (_DEBUG) console.log('starting from edge %s', first_edge);
    var self = this;

    do{
        var new_edges = _.difference(_linked_edges(last_edge, edge_pool), this.drawn_edges);
        var new_edge = new_edges[0];
        edge_pool = _.difference(edge_pool, [new_edge]);

        if (new_edge){
            if (_DEBUG) console.log('next edge found: %s', new_edge);
            var next_point = _diff_pt(new_edge, last_edge);
            console.log('next point: %s', next_point);
            if (_.contains(self.orders(), next_point.order)){
                done = true;
            } else {
                if (_DEBUG) console.log('adding point %s', next_point.order);
                this.points.push(next_point);
                self.drawn_edges.push(new_edge);

                last_edge = new_edge;
            }
        } else {
            if (_DEBUG) console.log('done with shape');
            done = true;
        }
    } while(!done);

}

Shape.prototype = {

    toString: function(){
        return util.format('shape[%s]', this.orders().join(', '));
    },

    orders: function(){
        return _.pluck(this.points, 'order');
    }

}

/* -------------- EXPORT --------------- */

module.exports = Shape;