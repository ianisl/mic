var spawn = require('child_process').spawn;
var isMac = require('os').type() == 'Darwin';
var isWindows = require('os').type().indexOf('Windows') > -1;
var AudioStream = require('./AudioStream.js');
var PassThrough = require('stream').PassThrough;

var mic = function mic(options) {
    options = options || {};
    var that = {};
    var debug = options.debug || false;
    var sox = options.sox || 'sox';
    var driver;
    var audioProcess = null;
    var infoStream = new PassThrough;
    var audioStream = new AudioStream();
    var audioProcessOptions = {
        stdio: ['ignore', 'pipe', 'ignore']
    };

    if (debug) {
        audioProcessOptions.stdio[2] = 'pipe';
    }

    that.start = function start() {
        if (audioProcess === null) {
            if (isWindows){
                driver = 'waveaudio';
                // Ne marche pas avec -d
                // Mais marche avec sox.exe -b 16 -r 44100 -c 2 -t waveaudio default test.wav
                // Et toutes les options fonctionnent

                // audioProcess = spawn('sox', ['-b', bitwidth, '--endian', endian, '-c', channels, '-r', rate, '-e', encoding, '-t', 'waveaudio', 'default', '-p'], audioProcessOptions)
            }
            else if (isMac){
                // Aucune option ne fonctionne (-b, -r, -c)
                // sox -b 16 --endian little -c 1 -r 44100 -e signed-integer -t coreaudio default test.wav
                // ou
                // sox -d test.wav
                driver = 'coreaudio';

                // audioProcess = spawn('rec', ['-b', bitwidth, '--endian', endian, '-c', channels, '-r', rate, '-e', encoding, '-t', fileType, '-'], audioProcessOptions)
            }
            else {
                // Toutes les options semblent fonctionner mais distortion sur l'enregistrement. Ne vient pas de sox (on a la même chose sur une autre app), semble venir de la VM en général
                // sox -b 16 --endian little -c 1 -r 44100 -e signed-integer -t alsa default test.wav
                // ou
                // sox -d test.wav
                driver = 'alsa';

                // audioProcess = spawn('arecord', ['-c', channels, '-r', rate, '-f', driver, '-D', device], audioProcessOptions);
            }
            audioProcess = spawn(sox, ['-t', driver, 'default', '-p'], audioProcessOptions);
            audioProcess.on('exit', function(code, sig) {
                if (code != null && sig === null) {
                    audioStream.emit('audioProcessExitComplete');
                    if (debug) {
                        console.log("recording audioProcess has exited with code = %d", code);
                    }
                }
            });
            audioProcess.stdout.pipe(audioStream);
            if (debug) {
                audioProcess.stderr.pipe(infoStream);
            }
            audioStream.emit('startComplete');
        } else {
            if (debug) {
                throw new Error("Duplicate calls to start(): Microphone already started!");
            }
        }
    };

    that.stop = function stop() {
        if (audioProcess != null) {
            audioProcess.kill('SIGTERM');
            audioProcess = null;
            audioStream.emit('stopComplete');
            if (debug) console.log("Microhphone stopped");
        }
    };

    that.pause = function pause() {
        if (audioProcess != null) {
            audioProcess.kill('SIGSTOP');
            audioStream.pause();
            audioStream.emit('pauseComplete');
            if (debug) console.log("Microphone paused");
        }
    };

    that.resume = function resume() {
        if (audioProcess != null) {
            audioProcess.kill('SIGCONT');
            audioStream.resume();
            audioStream.emit('resumeComplete');
            if (debug) console.log("Microphone resumed");
        }
    }

    that.getAudioStream = function getAudioStream() {
        return audioStream;
    }

    if (debug) {
        infoStream.on('data', function(data) {
                console.log("Received Info: " + data);
            });
        infoStream.on('error', function(error) {
                console.log("Error in Info Stream: " + error);
            });
    }

    return that;
}

module.exports = mic;
