var mic = require('../index.js');
var fs = require('fs');

var micInstance = mic({
    rate: '44100',
    channels: '1',
    debug: true,
    sox: '/usr/local/bin/sox'
    // TODO add option to provide path to sox
});

// Test: record 5 seconds of audio
// Play resulting raw file with sox, eg:
// $ play -b 16 -r 44100 -e signed output.raw

var micInputStream = micInstance.getAudioStream();
micInputStream.pipe(fs.WriteStream('output.raw'));

micInputStream.on('startComplete', function() {
    // Stop after 5 seconds
    setTimeout(function() {
        micInstance.stop();
    }, 5000);
});

micInputStream.on('data', function(data) {
});

micInputStream.on('error', function(err) {
});

micInputStream.on('stopComplete', function() {
});

micInputStream.on('processExitComplete', function() {
});

micInstance.start();
