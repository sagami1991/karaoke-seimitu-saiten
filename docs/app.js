/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CONST = {
    FRAMERATE: 44100,
    MELODY_WIDTH: 400,
    MELODY_HEIGHT: 300,
    MIDI_LEVEL_OFFSET: 50,
    BASE_SEC: 8,
    FFT: 2048,
    MIDI_RANGE: 24,
    FPS: 60,
    MIC_FREQ_OFFSET: 50
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const silhouette_1 = __webpack_require__(2);
const const_1 = __webpack_require__(0);
const util_1 = __webpack_require__(3);
class Application {
    constructor() {
        this.isLoop = false;
        this.enableVoiceCount = 0;
        this.melodyGuid = new MelodyGuid();
        this.stopButton = document.querySelector(".stop-button");
        this.startButton = document.querySelector(".start-button");
        this.micFrequencyDiv = document.querySelector(".mic-frequency");
        this.startButton.disabled = true;
        this.stopButton.disabled = true;
        this.startButton.addEventListener("click", () => {
            this.start();
        });
        this.stopButton.addEventListener("click", () => {
            this.stop();
            this.frame();
        });
        this.personMinIndex = Math.floor(const_1.CONST.FFT / 44100 * const_1.CONST.MIC_FREQ_OFFSET);
        const canvas = document.querySelector(".volume-meter");
        this.volumeCtx = canvas.getContext("2d");
        this.youtube = new YoutubeAPI();
        this.youtube.create();
    }
    main() {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = yield this.permissionMicInput();
            document.querySelector("audio").src = URL.createObjectURL(stream);
            this.audioContext = new AudioContext();
            this.analyser = this.audioContext.createAnalyser();
            this.timeDomain = new Float32Array(this.analyser.frequencyBinCount);
            this.frequency = new Uint8Array(this.analyser.frequencyBinCount);
            this.audioContext.createMediaStreamSource(stream).connect(this.analyser);
            this.startButton.disabled = false;
        });
    }
    start() {
        this.startButton.disabled = true;
        this.youtube.setStateChangeListener((state) => {
            switch (state) {
                case YT.PlayerState.PLAYING:
                    this.isLoop = true;
                    this.stopButton.disabled = false;
                    this.melodyGuid.start();
                    this.frame();
                    break;
                case YT.PlayerState.PAUSED:
                case YT.PlayerState.ENDED:
                    this.stop();
                    break;
            }
        });
        this.youtube.start();
    }
    stop() {
        this.stopButton.disabled = true;
        this.startButton.disabled = false;
        this.isLoop = false;
        this.melodyGuid.stop();
        this.youtube.stop();
    }
    frame() {
        const roopId = requestAnimationFrame(() => this.frame());
        this.analyser.getFloatTimeDomainData(this.timeDomain);
        this.analyser.getByteFrequencyData(this.frequency);
        const personVoiceFrequency = this.filterFrequency(this.frequency);
        const averageMicVolume = util_1.MathUtil.average(personVoiceFrequency);
        if (averageMicVolume > 20) {
            this.enableVoiceCount = 4;
            const squereFrequency = personVoiceFrequency.map((f) => f);
            const indexOfMaxValue = util_1.MathUtil.getIndexOfMaxValue(squereFrequency);
            // indexだけだと大雑把になるので線形補完
            const [y0, y1, y2] = squereFrequency.slice(indexOfMaxValue - 1, indexOfMaxValue + 2);
            const x1 = (y2 - y0) * 0.5 / (2 * y1 - y2 - y0);
            const frequency = util_1.AudioConvertUtil.indexToFrequency(indexOfMaxValue + x1 + this.personMinIndex);
            this.melodyGuid.addMic(frequency);
            this.micFrequencyDiv.textContent = `マイク音程: ${frequency}Hz`;
        }
        else if (this.enableVoiceCount >= 0) {
            this.enableVoiceCount--;
        }
        if (this.enableVoiceCount > 0) {
            this.renderVolume(averageMicVolume);
        }
        else {
            this.renderVolume(0);
        }
        if (!this.isLoop) {
            cancelAnimationFrame(roopId);
        }
    }
    filterFrequency(frequencyData) {
        const maxIndex = Math.floor(this.analyser.fftSize / 44100 * 3000);
        return frequencyData.slice(this.personMinIndex, maxIndex);
    }
    renderVolume(volume) {
        this.volumeCtx.clearRect(0, 0, 200, 100);
        this.volumeCtx.fillStyle = "blue";
        this.volumeCtx.beginPath();
        const volumePer = Math.floor(volume / 255 * 200);
        this.volumeCtx.fillRect(0, 0, volumePer, 10);
    }
    permissionMicInput() {
        return __awaiter(this, void 0, void 0, function* () {
            navigator.getUserMedia = navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia;
            return new Promise((resolve, reject) => {
                navigator.getUserMedia({
                    audio: true
                }, (stream) => {
                    resolve(stream);
                }, () => {
                    reject();
                });
            });
        });
    }
}
class YoutubeAPI {
    setStateChangeListener(func) {
        this.stateChange = func;
    }
    start() {
        this.player.playVideo();
    }
    stop() {
        this.player.stopVideo();
    }
    create() {
        window.onYouTubeIframeAPIReady = () => {
            this.player = new YT.Player("player", {
                events: {
                    // 再生状態変更イベント
                    "onStateChange": (e) => {
                        this.stateChange(e.data);
                    }
                }
            });
        };
        const scriptElement = document.createElement("script");
        scriptElement.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(scriptElement);
        const splitedUrl = location.href.split("/");
        const currentUrl = `${splitedUrl[0]}//${splitedUrl[2]}`;
        const param = `version=3&enablejsapi=1&origin=${currentUrl}`;
        const iframe = util_1.ElementUtil.builder(`
            <iframe id="player" width="${560}" height="${315}"
             src="https://www.youtube.com/embed/${"cXeb9cb6k0I"}?${param}"
             frameborder="0"></iframe>
        `);
        const youtubeContainer = document.querySelector(".youtube-container");
        youtubeContainer.appendChild(iframe);
    }
}
class MelodyGuid {
    constructor() {
        this.isLoop = false;
        this.octabeElement = document.querySelector(".octabe");
        const canvas = document.querySelector(".melody-guide");
        this.ctx = canvas.getContext("2d");
        this.MicRecords = [];
        silhouette_1.silhouette.tracks[0].notes.forEach((note) => note.time += silhouette_1.silhouette.delay);
    }
    start() {
        this.MicRecords = [];
        this.isLoop = true;
        this.startTime = new Date();
        this.frame();
    }
    stop() {
        this.isLoop = false;
    }
    addMic(frequency) {
        const now = (new Date().getTime() - this.startTime.getTime()) / 1000;
        let midi = util_1.AudioConvertUtil.frequencyToMidi(frequency);
        if (60 > midi) {
            midi += 12;
            if (60 - 12 > midi) {
                midi += 12;
            }
            this.octabeElement.textContent = "オク下である";
        }
        else {
            this.octabeElement.textContent = "オク下でない";
        }
        this.MicRecords.push({
            time: now,
            midi: midi
        });
    }
    frame() {
        const roopId = requestAnimationFrame(() => this.frame());
        this.ctx.clearRect(0, 0, const_1.CONST.MELODY_WIDTH, const_1.CONST.MELODY_HEIGHT);
        const now = (new Date().getTime() - this.startTime.getTime()) / 1000;
        const notes = silhouette_1.silhouette.tracks[0].notes;
        const offset = Math.floor(now / const_1.CONST.BASE_SEC) * const_1.CONST.BASE_SEC;
        const rangeNote = this.filterRange(notes, offset);
        const rangeMic = this.filterRange(this.MicRecords, offset);
        for (const note of rangeNote) {
            this.renderBlock(note.midi, note.time - offset, note.duration);
        }
        for (const [i, mic] of rangeMic.entries()) {
            this.renderMic(mic.midi, mic.time - offset);
        }
        this.renderLine();
        this.renderNowTime(now - offset);
        if (!this.isLoop) {
            cancelAnimationFrame(roopId);
        }
    }
    filterRange(blocks, offset) {
        return blocks.filter((block) => offset <= block.time && block.time < offset + const_1.CONST.BASE_SEC);
    }
    renderLine() {
        this.ctx.strokeStyle = "black";
        for (let i = 0; i <= const_1.CONST.MIDI_RANGE; i++) {
            this.ctx.lineWidth = 1;
            const h = Math.floor(i * const_1.CONST.MELODY_HEIGHT / const_1.CONST.MIDI_RANGE);
            this.ctx.beginPath();
            this.ctx.moveTo(0, h);
            this.ctx.lineTo(const_1.CONST.MELODY_WIDTH, h);
            this.ctx.stroke();
        }
    }
    renderBlock(midiLevel, start, duration) {
        if (midiLevel < const_1.CONST.MIDI_LEVEL_OFFSET ||
            const_1.CONST.MIDI_LEVEL_OFFSET + const_1.CONST.MIDI_RANGE <= midiLevel) {
            return;
        }
        const width = duration / const_1.CONST.BASE_SEC * const_1.CONST.MELODY_WIDTH;
        const x = start / const_1.CONST.BASE_SEC * const_1.CONST.MELODY_WIDTH;
        const y = const_1.CONST.MELODY_HEIGHT - (midiLevel - const_1.CONST.MIDI_LEVEL_OFFSET) / const_1.CONST.MIDI_RANGE * const_1.CONST.MELODY_HEIGHT;
        const height = const_1.CONST.MELODY_HEIGHT / const_1.CONST.MIDI_RANGE;
        this.ctx.fillStyle = "green";
        this.ctx.beginPath();
        this.ctx.fillRect(x, y, width, height);
    }
    renderMic(midiLevel, start) {
        this.ctx.fillStyle = "red";
        const unitHeight = const_1.CONST.MELODY_HEIGHT / const_1.CONST.MIDI_RANGE;
        const unitWidth = const_1.CONST.MELODY_WIDTH / const_1.CONST.BASE_SEC / 30;
        const x = start / const_1.CONST.BASE_SEC * const_1.CONST.MELODY_WIDTH - unitWidth * 6;
        const y = const_1.CONST.MELODY_HEIGHT - (midiLevel - const_1.CONST.MIDI_LEVEL_OFFSET) / const_1.CONST.MIDI_RANGE * const_1.CONST.MELODY_HEIGHT
            + unitHeight / 4;
        this.ctx.beginPath();
        this.ctx.fillRect(x, y, unitWidth, unitHeight / 2);
    }
    renderNowTime(time) {
        this.ctx.strokeStyle = "blue";
        this.ctx.beginPath();
        this.ctx.moveTo(time / const_1.CONST.BASE_SEC * const_1.CONST.MELODY_WIDTH, 0);
        this.ctx.lineTo(time / const_1.CONST.BASE_SEC * const_1.CONST.MELODY_WIDTH, const_1.CONST.MELODY_HEIGHT);
        this.ctx.stroke();
    }
}
(() => __awaiter(this, void 0, void 0, function* () {
    try {
        yield new Application().main();
    }
    catch (error) {
        alert("ブラウザが対応してないかマイクがないとできないよ");
        throw error;
    }
}))();


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.silhouette = {
    "header": {
        "PPQ": 480,
        "timeSignature": [
            4,
            4
        ],
        "bpm": 182.99991765003705,
        "name": ""
    },
    "startTime": 0.327869,
    "duration": 86.96656918958301,
    "delay": 0.65,
    "tracks": [
        {
            "startTime": 0.327869,
            "duration": 86.96656918958301,
            "length": 265,
            "notes": [
                // {
                //     "name": "B3",
                //     "midi": 59,
                //     "time": 0.327869,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.16325143958333338
                // },
                // {
                //     "name": "A3",
                //     "midi": 57,
                //     "time": 0.49180350000000006,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.16325143958333332
                // },
                // {
                //     "name": "B3",
                //     "midi": 59,
                //     "time": 0.655738,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.16325143958333332
                // },
                // {
                //     "name": "D4",
                //     "midi": 62,
                //     "time": 0.8196725,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.24521868958333326
                // },
                // {
                //     "name": "A3",
                //     "midi": 57,
                //     "time": 1.1475415,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.16325143958333332
                // },
                // {
                //     "name": "B3",
                //     "midi": 59,
                //     "time": 1.311476,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.16325143958333332
                // },
                // {
                //     "name": "A3",
                //     "midi": 57,
                //     "time": 1.4754105000000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.16325143958333332
                // },
                // {
                //     "name": "B3",
                //     "midi": 59,
                //     "time": 1.6393450000000003,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.16325143958333332
                // },
                // {
                //     "name": "D4",
                //     "midi": 62,
                //     "time": 1.8032795000000004,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.24521868958333348
                // },
                // {
                //     "name": "A3",
                //     "midi": 57,
                //     "time": 2.1311485000000006,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.16325143958333355
                // },
                // {
                //     "name": "B3",
                //     "midi": 59,
                //     "time": 2.295083000000001,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.16325143958333355
                // },
                // {
                //     "name": "D4",
                //     "midi": 62,
                //     "time": 2.9508210000000012,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.4911204395833333
                // },
                // {
                //     "name": "D5",
                //     "midi": 74,
                //     "time": 2.9508210000000012,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.4911204395833333
                // },
                // {
                //     "name": "A3",
                //     "midi": 57,
                //     "time": 3.4426245000000013,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.4911204395833333
                // },
                // {
                //     "name": "A4",
                //     "midi": 69,
                //     "time": 3.4426245000000013,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.4911204395833333
                // },
                // {
                //     "name": "D4",
                //     "midi": 62,
                //     "time": 3.9344280000000014,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.327185939583333
                // },
                // {
                //     "name": "D5",
                //     "midi": 74,
                //     "time": 3.9344280000000014,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.327185939583333
                // },
                // {
                //     "name": "E4",
                //     "midi": 64,
                //     "time": 4.262297000000001,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "E5",
                //     "midi": 76,
                //     "time": 4.262297000000001,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "A3",
                //     "midi": 57,
                //     "time": 4.754100500000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "A4",
                //     "midi": 69,
                //     "time": 4.754100500000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "E4",
                //     "midi": 64,
                //     "time": 5.245904000000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.327185939583333
                // },
                // {
                //     "name": "E5",
                //     "midi": 76,
                //     "time": 5.245904000000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.327185939583333
                // },
                // {
                //     "name": "F#4",
                //     "midi": 66,
                //     "time": 5.573773000000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "F#5",
                //     "midi": 78,
                //     "time": 5.573773000000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "G4",
                //     "midi": 67,
                //     "time": 6.065576500000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "G5",
                //     "midi": 79,
                //     "time": 6.065576500000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "F#4",
                //     "midi": 66,
                //     "time": 6.557380000000003,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.1632514395833331
                // },
                // {
                //     "name": "F#5",
                //     "midi": 78,
                //     "time": 6.557380000000003,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.1632514395833331
                // },
                // {
                //     "name": "E4",
                //     "midi": 64,
                //     "time": 6.721314500000003,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.1632514395833331
                // },
                // {
                //     "name": "E5",
                //     "midi": 76,
                //     "time": 6.721314500000003,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.1632514395833331
                // },
                // {
                //     "name": "D4",
                //     "midi": 62,
                //     "time": 6.885249000000003,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "D5",
                //     "midi": 74,
                //     "time": 6.885249000000003,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "G4",
                //     "midi": 67,
                //     "time": 7.377052500000003,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "G5",
                //     "midi": 79,
                //     "time": 7.377052500000003,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "F#4",
                //     "midi": 66,
                //     "time": 7.868856000000004,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.1632514395833331
                // },
                // {
                //     "name": "F#5",
                //     "midi": 78,
                //     "time": 7.868856000000004,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.1632514395833331
                // },
                // {
                //     "name": "E4",
                //     "midi": 64,
                //     "time": 8.032790500000003,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.163251439583334
                // },
                // {
                //     "name": "E5",
                //     "midi": 76,
                //     "time": 8.032790500000003,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.163251439583334
                // },
                // {
                //     "name": "D4",
                //     "midi": 62,
                //     "time": 8.196725000000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "D5",
                //     "midi": 74,
                //     "time": 8.196725000000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "G4",
                //     "midi": 67,
                //     "time": 8.688528500000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "G5",
                //     "midi": 79,
                //     "time": 8.688528500000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "F#4",
                //     "midi": 66,
                //     "time": 9.180332000000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.32718593958333386
                // },
                // {
                //     "name": "F#5",
                //     "midi": 78,
                //     "time": 9.180332000000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.32718593958333386
                // },
                // {
                //     "name": "D4",
                //     "midi": 62,
                //     "time": 9.508201000000001,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.9829239395833334
                // },
                // {
                //     "name": "D5",
                //     "midi": 74,
                //     "time": 9.508201000000001,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.9829239395833334
                // },
                // {
                //     "name": "G4",
                //     "midi": 67,
                //     "time": 10.819677000000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "G5",
                //     "midi": 79,
                //     "time": 10.819677000000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "F#4",
                //     "midi": 66,
                //     "time": 11.311480500000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "F#5",
                //     "midi": 78,
                //     "time": 11.311480500000002,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "D4",
                //     "midi": 62,
                //     "time": 11.803284000000001,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.32718593958333386
                // },
                // {
                //     "name": "D5",
                //     "midi": 74,
                //     "time": 11.803284000000001,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.32718593958333386
                // },
                // {
                //     "name": "E4",
                //     "midi": 64,
                //     "time": 12.131153000000001,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "E5",
                //     "midi": 76,
                //     "time": 12.131153000000001,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "F#4",
                //     "midi": 66,
                //     "time": 12.6229565,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "F#5",
                //     "midi": 78,
                //     "time": 12.6229565,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.49112043958333373
                // },
                // {
                //     "name": "C#4",
                //     "midi": 61,
                //     "time": 13.11476,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.32718593958333386
                // },
                // {
                //     "name": "C#5",
                //     "midi": 73,
                //     "time": 13.11476,
                //     "velocity": 0.6299212598425197,
                //     "duration": 0.32718593958333386
                // },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 13.442629,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 13.770498,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 14.098367,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 14.426236,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6550549395833336
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 15.737712,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833321
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 16.065580999999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 16.229515499999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 16.393449999999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 16.557384499999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 16.721318999999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 17.049187999999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 17.213122499999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.49112043958333373
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 17.704925999999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 18.032794999999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 18.360663999999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 18.688532999999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 19.344270999999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 19.672139999999995,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 20.000008999999995,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 20.655746999999995,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 20.983615999999994,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 21.311484999999994,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 21.967222999999994,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6550549395833336
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 22.622960999999993,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 22.950829999999993,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 23.278698999999992,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 23.606567999999992,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 23.934436999999992,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 24.26230599999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 24.59017499999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 24.91804399999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6550549395833336
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 26.22951999999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 26.39345449999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 26.55738899999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 26.88525799999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 27.04919249999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 27.21312699999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 27.54099599999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 27.70493049999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.49112043958333373
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 28.19673399999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 28.52460299999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 28.852471999999988,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 29.180340999999988,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 29.836078999999987,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 30.163947999999987,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 30.491816999999987,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 31.147554999999986,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 31.475423999999986,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 31.803292999999986,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32718593958333386
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 32.45903099999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.65505493958333
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 33.11476899999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 33.44263799999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 33.77050699999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 34.09837599999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "B3",
                    "midi": 59,
                    "time": 34.75411399999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 34.91804849999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 35.24591749999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.49112043958333373
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 35.73772099999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 36.06558999999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 36.2295245,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 36.557393499999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.49112043958333373
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 37.049197,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 37.377066,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 37.5410005,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 37.8688695,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 38.032804000000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 38.360673000000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "B3",
                    "midi": 59,
                    "time": 39.016411000000005,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 39.344280000000005,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 39.672149000000005,
                    "velocity": 0.6299212598425197,
                    "duration": 0.65505493958333
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 40.327887000000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.65505493958333
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 40.983625,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 41.311494,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 41.639363,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 42.295101,
                    "velocity": 0.6299212598425197,
                    "duration": 0.65505493958333
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 42.950839,
                    "velocity": 0.6299212598425197,
                    "duration": 0.65505493958333
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 43.606577,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 43.934446,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 44.262315,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 44.590184,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A3",
                    "midi": 57,
                    "time": 44.918053,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 44.918053,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A3",
                    "midi": 57,
                    "time": 45.245922,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A3",
                    "midi": 57,
                    "time": 45.573791,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 45.573791,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 45.90166,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 45.90166,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 46.229529,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 46.229529,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 46.557398,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 46.7213325,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 46.885267000000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.49112043958333373
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 47.541005000000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A3",
                    "midi": 57,
                    "time": 47.868874000000005,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 48.196743000000005,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 48.524612000000005,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "G4",
                    "midi": 67,
                    "time": 48.852481000000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 49.180350000000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 49.34428450000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 49.50821900000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 49.83608800000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 50.16395700000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 50.81969500000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 51.14756400000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 51.47543300000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 52.13117100000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 52.45904000000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 52.78690900000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 53.44264700000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.65505493958333
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 54.09838500000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 54.42625400000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 54.75412300000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 55.08199200000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 55.40986100000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A3",
                    "midi": 57,
                    "time": 55.737730000000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 56.065599000000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 56.393468000000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 56.393468000000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 56.721337000000005,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 56.721337000000005,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 57.049206000000005,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 57.21314050000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 57.37707500000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.49112043958333373
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 58.03281300000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A3",
                    "midi": 57,
                    "time": 58.36068200000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 58.68855100000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 59.01642000000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "G4",
                    "midi": 67,
                    "time": 59.34428900000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 59.67215800000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 59.836092500000014,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 60.00002700000002,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 60.32789600000002,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 60.65576500000002,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 61.311503000000016,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 61.639372000000016,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 61.967241000000016,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 62.622979000000015,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 62.950848000000015,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 63.278717000000015,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 63.934455000000014,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6550549395833372
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 64.59019300000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 64.918062,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 65.245931,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 65.57379999999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 65.90166899999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A3",
                    "midi": 57,
                    "time": 66.22953799999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 66.55740699999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 66.88527599999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 67.21314499999995,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 67.54101399999995,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 67.70494849999994,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 67.86888299999994,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 68.19675199999993,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 68.52462099999994,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A3",
                    "midi": 57,
                    "time": 68.85248999999993,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 69.18035899999992,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 69.50822799999992,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "G4",
                    "midi": 67,
                    "time": 69.83609699999991,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 70.1639659999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 70.4918349999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 70.81970399999989,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 71.14757299999988,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 71.80331099999988,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 72.13117999999987,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 72.45904899999987,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 73.11478699999986,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 73.44265599999986,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 73.77052499999985,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 74.42626299999985,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6550549395833372
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 75.08200099999985,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 75.40986999999984,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 75.73773899999983,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 76.06560799999983,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 76.72134599999983,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 76.88528049999982,
                    "velocity": 0.6299212598425197,
                    "duration": 0.49112043958332663
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 77.37708399999981,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 77.7049529999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 78.0328219999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 78.1967564999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.49112043958332663
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 78.68855999999978,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 79.01642899999977,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 79.34429799999977,
                    "velocity": 0.6299212598425197,
                    "duration": 0.163251439583334
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 79.50823249999976,
                    "velocity": 0.6299212598425197,
                    "duration": 0.49112043958332663
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 80.00003599999975,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 80.32790499999975,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "G3",
                    "midi": 55,
                    "time": 80.98364299999974,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6550549395833372
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 81.63938099999974,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6550549395833372
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 82.29511899999974,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6550549395833372
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 82.95085699999974,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 83.27872599999974,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 83.60659499999973,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "B3",
                    "midi": 59,
                    "time": 83.93446399999972,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3271859395833303
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 84.26233299999971,
                    "velocity": 0.6299212598425197,
                    "duration": 2.163251439583334
                },
            ],
            "controlChanges": {
                "7": [
                    {
                        "number": 7,
                        "time": 0,
                        "value": 0.7874015748031497
                    }
                ],
                "10": [
                    {
                        "number": 10,
                        "time": 0,
                        "value": 0.5039370078740157
                    }
                ],
                "91": [
                    {
                        "number": 91,
                        "time": 0,
                        "value": 0
                    }
                ],
                "93": [
                    {
                        "number": 93,
                        "time": 0,
                        "value": 0
                    }
                ],
                "121": [
                    {
                        "number": 121,
                        "time": 0,
                        "value": 0
                    }
                ]
            },
            "id": 0,
            "instrumentNumber": 65,
            "instrument": "alto sax",
            "instrumentFamily": "reed",
            "channelNumber": 0,
            "isPercussion": false
        }
    ]
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = __webpack_require__(0);
class ElementUtil {
    static builder(html) {
        const container = document.createElement("div");
        container.innerHTML = html;
        if (container.children.length !== 1) {
            throw new Error(`親要素はひとつまで 数: ${container.children.length} html: ${html}`);
        }
        const element = container.firstElementChild;
        container.removeChild(element);
        return element;
    }
}
exports.ElementUtil = ElementUtil;
class MathUtil {
    static average(array) {
        return MathUtil.sum(array) / array.length;
    }
    static sum(array) {
        let sum = 0;
        for (const num of array) {
            sum += num;
        }
        return sum;
    }
    static getIndexOfMaxValue(array) {
        return array.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    }
    static tail(array) {
        return array[array.length - 1];
    }
}
exports.MathUtil = MathUtil;
class AudioConvertUtil {
    static frequencyToMidi(f) {
        return Math.log2(f / 440) * 12 + 69;
    }
    static indexToFrequency(index) {
        return Math.round(index * const_1.CONST.FRAMERATE / const_1.CONST.FFT);
    }
}
exports.AudioConvertUtil = AudioConvertUtil;


/***/ })
/******/ ]);
//# sourceMappingURL=app.js.map