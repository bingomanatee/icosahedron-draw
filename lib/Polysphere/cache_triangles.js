var _ = require('underscore');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _DEBUG = false;

/* ------------ CLOSURE --------------- */

/** ********************
 * Purpose: To cache a set of drawn triangles
 * @return void
 */

function cache_triangles(file_path, callback, faces) {

    var handle = fs.createWriteStream(file_path);
    handle.write('{"triangles": [');

    if (this.listeners('draw_points').length) throw new Error('already set to listen to draw points');
    var count = 0;
    this.on('draw_points', function (order, points) {
        if (_DEBUG) console.log('order: %s: %s', order, util.inspect(points));
        handle.write(JSON.stringify({o: order, p: points}));
        ++count;
    });

    this.render(faces.faces);

    handle.end(']}', callback);
}

/* -------------- EXPORT --------------- */

module.exports = cache_triangles;