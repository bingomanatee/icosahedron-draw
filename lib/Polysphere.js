var _ = require('underscore');
var events = require('events');
var util = require('util');
var Triangle = require('./Triangle');

/**
 * reflects a polyhedron as a purely 2D artifact.
 *
 * Polyspheres can represent sub-sectors of a complete polysphere.
 *
 * @param width {posint}
 * @param height {posint}
 * @param vertices [{vertex}] (optional)
 * @constructor
 */

function Polysphere(width, height, vertices, faces) {
    this.width = width || 1;
    this.height = height || 1;
    this.vertices = [];
    this.faces = [];

    if (vertices && _.isArray(vertices)) {
        vertices.forEach(function (vertex) {
            this.on_vertex(vertex)
        }, this);
    }

    if (faces && _.isArray(faces)) {
        faces.forEach(function (face) {
            this.on_face(face)
        }, this);
    }

    this.on('face', _.bind(this.on_face, this));
    this.on('vertex', _.bind(this.on_vertex, this));
}

util.inherits(Polysphere, events.EventEmitter);

_.extend(Polysphere.prototype, {

    on_vertex: function (vertex) {
        var ro = vertex.ro;
        this.vertices[ro] = _.pick(vertex, 'c', 'uv', 'n', 'color', 'ro');
    },

    on_face: function (face) {
        if (!_.isArray(face)) {
            throw new Error('face must be an array');
        }

        var t = new Triangle(face, this);

        var frag = t.frag();

        return frag.map(function (data) {
            if (_.isUndefined(data[0])) {
                throw new Error('no order');
            }
            this.emit('facet', data[0], data[1], data[2], data[3]);
        }, this);
    }

});

module.exports = Polysphere;