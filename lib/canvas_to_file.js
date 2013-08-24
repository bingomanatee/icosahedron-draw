var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;
var Gate = require('gate');

/* ************************************
 * renders a canvas to a file.
 * ************************************ */

/* ******* CLOSURE ********* */

/* ********* EXPORTS ******** */

module.exports = function (c, file, cb) {
	var out = fs.createWriteStream(file), stream = c.pngStream();
    out.on('finish', function(){
        process.nextTick(cb);
    });
   stream.pipe(out);
} // end export function