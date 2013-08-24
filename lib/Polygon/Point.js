var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var _id = 0;

function Poly_Point(order, x, y) {
    this.order = order;
    this.x = x;
    this.y = y;
    this.id = ++_id;
}

Poly_Point.prototype = {

};

module.exports = Poly_Point;