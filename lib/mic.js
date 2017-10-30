const {spawn} = require('child_process');
const {PassThrough} = require('stream');

const createMicInstance = (options = {}) => {
    const instance = {};
    const isMac = require('os').type() == 'Darwin';
    const isWindows = require('os').type().indexOf('Windows') > -1;
    const debug = options.debug || false;
    const sox = options.sox || 'sox';
    const infoStream = new PassThrough;
    const audioStream = new PassThrough;
    let audioProcessOptions = {
        stdio: ['ignore', 'pipe', 'ignore']
    };
    let driver;
    let audioProcess = null;
    let hasAudioStarted = false;

    if (debug) {
        audioProcessOptions.stdio[2] = 'pipe';
    }

    instance.start = () => {
        if (audioProcess === null) {
            if (isWindows){
                driver = 'waveaudio';
            }
            else if (isMac){
                driver = 'coreaudio';
            }
            else {
                driver = 'alsa';
            }
            audioProcess = spawn(sox, ['-t', driver, 'default', '-t', 'wav', '-'], audioProcessOptions); // It is necessary to specify the output file format with '-t wav' when piping sox's output, as sox can't infer the format through the output file extension
            audioProcess.on('exit', (code, sig) => {
                if (code != null && sig === null) {
                    audioStream.emit('exit', code);
                }
            });
            audioProcess.stdout.pipe(audioStream);
            audioStream.on('data', function(data) {
                if (!hasAudioStarted) {
                    hasAudioStarted = true;
                    audioStream.emit('start');
                }
            });
            if (debug) {
                audioProcess.stderr.pipe(infoStream);
                infoStream.on('data', function(data) {
                    console.log(data.toString()); // Print SoX output
                });
            }
        } else {
            throw new Error("Duplicate calls to start(): Microphone already started!");
        }
    };

    instance.stop = () => {
        if (audioProcess != null) {
            audioProcess.kill('SIGTERM');
            audioProcess = null;
            audioStream.emit('stop');
        }
    };

    instance.pause = function pause() {
        if (audioProcess != null) {
            audioProcess.kill('SIGSTOP');
            audioStream.pause();
            audioStream.emit('pause');
        }
    };

    instance.resume = function resume() {
        if (audioProcess != null) {
            audioProcess.kill('SIGCONT');
            audioStream.resume();
            audioStream.emit('resume');
        }
    }

    instance.getAudioStream = () => audioStream;

    return instance;
}

module.exports = createMicInstance;
