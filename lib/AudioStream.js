var Transform = require('stream').Transform;
var util = require("util");

function AudioStream() {
    Transform.call(this);
};
util.inherits(AudioStream, Transform);

AudioStream.prototype._transform = function(chunk, encoding, callback) {
    this.push(chunk);
    callback();
};

module.exports = AudioStream;
