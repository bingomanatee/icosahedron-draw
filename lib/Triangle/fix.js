var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;

/* ************************************
 * 
 * ************************************ */

/* ******* CLOSURE ********* */

function _d2(a, b){
    return a.reduce(function(out, value, i){
        var d = value - b[i];
        return out + (d * d);
    }, 0);
}

/* ********* EXPORTS ******** */

module.exports = function (t) {

	var ab = _d2(t.a, t.b);
	var bc = _d2(t.b, t.c);
	var ca = _d2(t.c, t.a);

	var distances = [
		{p: 'a', pt: t.a, others: [t.b, t.c], v: ab + ca},
		{p: 'b', pt: t.b, others: [t.a, t.c], v: ab + bc},
		{p: 'c', pt: t.c, others: [t.a, t.b], v: bc + ca}
	];

	var best_dist = _.sortBy(distances, 'v').pop();

	var mutants = [
		[0, 0],
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0]
	];

	var mutant_distances = _.map(mutants, function (m) {
		m.new_point = best_dist.pt.clone();
		m.new_point.add(m);
		m.v = _.reduce(best_dist.others, function (out, p) {
			return out + _d2(p, m.new_point);
		}, 0);

		return m;
	});

	var best_mutant = _.sortBy(mutant_distances, 'v').shift();
	t[best_dist.p] = best_mutant.new_point;

};