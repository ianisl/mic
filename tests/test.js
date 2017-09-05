const createMicInstance = require('../index.js');
const fs = require('fs');

// Test: record 5 seconds of audio.
// Play resulting raw file with sox, eg:
// $ play -b 16 -r 44100 -e signed output.raw

const micInstance = createMicInstance({
    debug: false,
    sox: '/usr/local/bin/sox' // Adapt
});

const micInputStream = micInstance.getAudioStream();
micInputStream.pipe(fs.WriteStream('output.wav'));

micInputStream.on('start', function() {
    setTimeout(function() {
        micInstance.stop();
    }, 5000);
});

micInputStream.on('data', function(data) {
});

micInputStream.on('error', function(err) {
});

micInputStream.on('stop', function() {
});

micInputStream.on('exit', function(code) {
    console.log('---- emitted exit with code = %d', code);
});

micInstance.start();
