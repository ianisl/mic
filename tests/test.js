const createMicInstance = require('../index.js');
const fs = require('fs');

// Test: record 5 seconds of audio.
// Play resulting raw file with sox, eg:
// $ play -b 16 -r 44100 -e signed output.raw

const micInstance = createMicInstance({
    debug: true,
    sox: '/usr/local/bin/sox' // Adapt to your config
});

const micInputStream = micInstance.getAudioStream();
micInputStream.pipe(fs.WriteStream('output.wav'));

micInputStream.on('start', () => {
    setTimeout(() => micInstance.stop(), 5000);
});

micInputStream.on('exit', code => console.log('---- emitted exit with code = %d', code));
// Other handlers:
// micInputStream.on('data', data => {});
// micInputStream.on('error', err => {});
// micInputStream.on('stop', () => {});

micInstance.start();
