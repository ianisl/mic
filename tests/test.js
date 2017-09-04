var mic = require('../index.js');
var fs = require('fs');

var micInstance = mic({
    rate: '44100',
    channels: '1',
    debug: true
    // TODO add option to provide path to sox
});

// Test: record 5 seconds of audio
// Play resulting raw file with sox, eg:
// $ play -b 16 -r 44100 -e signed output.raw

var micInputStream = micInstance.getAudioStream();
micInputStream.pipe(fs.WriteStream('output.raw'));

micInputStream.on('data', function(data) {
    console.log("Recieved Input Stream: " + data.length);
});

micInputStream.on('error', function(err) {
    cosole.log("Error in Input Stream: " + err);
});

micInputStream.on('startComplete', function() {
    // 'startComplete': This is emitted once the start() function is successfully executed
    console.log("Got SIGNAL startComplete");
    setTimeout(function() {
            micInstance.stop();
    }, 5000);
});

micInputStream.on('stopComplete', function() {
    console.log("Got SIGNAL stopComplete");
});

micInputStream.on('processExitComplete', function() {
    console.log("Got SIGNAL processExitComplete");
});

micInstance.start();
