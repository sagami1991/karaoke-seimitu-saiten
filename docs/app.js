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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = __webpack_require__(1);
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
    static getSvgIcon(icon, size = "m", className) {
        return `
        <svg xmlns="http://www.w3.org/2000/svg" class="icon-svg icon-${size} ${className || ""}">
            <use xlink:href="#${icon}"/>
        </svg>`;
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
    static MidiToFrequency(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }
    static indexToFrequency(index) {
        return Math.round(index * const_1.CONST.FRAMERATE / const_1.CONST.FFT);
    }
}
exports.AudioConvertUtil = AudioConvertUtil;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CONST = {
    FRAMERATE: 44100,
    MELODY_WIDTH: 400,
    MELODY_HEIGHT: 300,
    BASE_SEC: 8,
    FFT: 2048,
    MIDI_RANGE: 24,
    FPS: 60,
    MIC_FREQ_OFFSET: 50
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Observable {
    constructor() {
        this.listenMap = new Map();
    }
    static createObserverId() {
        return `observer_${this.observerId++}`;
    }
    addListener(name, observerId, cb) {
        if (this.listenMap.get(observerId) === undefined) {
            this.listenMap.set(observerId, {});
        }
        this.listenMap.get(observerId)[name] = cb;
    }
    disposeObserve(observerId) {
        this.listenMap.delete(observerId);
    }
    trigger(name, args) {
        this.listenMap.forEach(map => {
            const callback = map[name];
            if (callback) {
                callback(args);
            }
        });
    }
    getObservers() {
        return Array.from(this.listenMap.values());
    }
}
Observable.observerId = 0;
exports.Observable = Observable;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __webpack_require__(0);
class ComponentScanner {
    static register(component, option) {
        this.id++;
        this.components.set(this.id, { component: component, option: option });
        return this.id;
    }
    static scanHtml(html) {
        const outerElem = util_1.ElementUtil.builder(html);
        this.scan(outerElem);
        return outerElem;
    }
    static scanHtmls(html) {
        const container = document.createElement("div");
        container.innerHTML = html;
        this.scan(container);
        const elements = [];
        while (container.firstChild) {
            const element = container.firstChild;
            container.removeChild(element);
            elements.push(element);
        }
        return elements;
    }
    static scan(outerElem) {
        const elements = outerElem.querySelectorAll(".my-component");
        if (elements.length === 0) {
            // throw new Error("Component not found");
        }
        for (const element of Array.from(elements)) {
            const id = element.getAttribute("component-id");
            if (!id) {
                throw new Error("予期せぬエラー component-idが存在しない");
            }
            const componentId = +id;
            const componentSet = this.components.get(componentId);
            if (componentSet === undefined) {
                throw new Error("すでにスキャン済み");
            }
            this.components.delete(componentId);
            componentSet.component.preInitElem(element);
            componentSet.component.initElem(element, componentSet.option);
        }
    }
}
ComponentScanner.components = new Map();
ComponentScanner.id = 0;
exports.ComponentScanner = ComponentScanner;


/***/ }),
/* 4 */
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
const const_1 = __webpack_require__(1);
const util_1 = __webpack_require__(0);
const AudioAnalyzer_1 = __webpack_require__(5);
const selectTrackView_1 = __webpack_require__(6);
class Application {
    constructor() {
        this.melodyGuid = new MelodyGuid();
        this.stopButton = document.querySelector(".stop-button");
        this.stopButton.disabled = true;
        this.stopButton.addEventListener("click", () => {
            this.stop();
            this.frame();
        });
        this.youtube = new YoutubeAPI();
        this.volumeUI = new VolumeUI();
        this.appendInlineSvg();
        this.playMode = "STOP";
        this.downloadLink = document.querySelector(".download");
    }
    main() {
        return __awaiter(this, void 0, void 0, function* () {
            const selectTrackView = new selectTrackView_1.SelectTrackView();
            yield this.youtube.create();
            const stream = yield this.permissionMicInput();
            this.audioAnalyzer = new AudioAnalyzer_1.AudioAnalyzer(stream);
            let intervalId = 0;
            selectTrackView.addListener("select", "1", (track) => {
                this.stop();
                this.changeTrack(track);
            });
            document.querySelector(".track-select-container").appendChild(selectTrackView.el);
            this.youtube.setStateChangeListener((state) => {
                switch (state) {
                    case YT.PlayerState.PLAYING:
                        intervalId = this.start();
                        break;
                    case YT.PlayerState.PAUSED:
                    case YT.PlayerState.ENDED:
                        clearInterval(intervalId);
                        this.stop();
                        break;
                }
            });
        });
    }
    appendInlineSvg() {
        const svgText = __webpack_require__(12);
        const svgContainer = document.querySelector(".svg-container");
        svgContainer.innerHTML = svgText;
    }
    changeTrack(track) {
        return __awaiter(this, void 0, void 0, function* () {
            this.youtube.setVideo(track.youtubeId);
            this.melodyGuid.setTrack(track);
        });
    }
    start() {
        this.playMode = "PLAYING";
        // this.downloadLink.style.display = "none";
        this.stopButton.disabled = false;
        this.melodyGuid.start();
        // this.audioAnalyzer.startRecord();
        return setInterval(() => {
            this.frame();
        }, 1000 / const_1.CONST.FPS);
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.playMode === "STOP") {
                return;
            }
            this.playMode = "STOP";
            this.stopButton.disabled = true;
            this.youtube.stop();
            // const audioUrl = await this.audioAnalyzer.stopRecord();
            // this.downloadLink.style.display = "inline-block";
            // this.downloadLink.href = audioUrl;
        });
    }
    frame() {
        const micData = this.audioAnalyzer.getFrameMicData();
        const nowMidi = this.melodyGuid.getNowMidi();
        if (micData.frequency) {
            this.melodyGuid.addMicPitch(micData.frequency);
        }
        if (nowMidi && micData.frequency) {
            const pitch = util_1.AudioConvertUtil.MidiToFrequency(nowMidi) / micData.frequency;
            this.audioAnalyzer.setPitch(pitch);
        }
        else {
            this.audioAnalyzer.setPitch(1);
        }
        this.volumeUI.render(micData.volume);
        this.melodyGuid.render();
    }
    permissionMicInput() {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;
        return navigator.mediaDevices.getUserMedia({
            audio: true
        });
    }
}
class VolumeUI {
    constructor() {
        const canvas = document.querySelector(".volume-meter");
        this.volumeCtx = canvas.getContext("2d");
    }
    render(volume) {
        this.volumeCtx.clearRect(0, 0, 200, 100);
        this.volumeCtx.fillStyle = "rgb(250, 65, 63)";
        this.volumeCtx.beginPath();
        const volumePer = Math.floor(volume / 255 * 200);
        this.volumeCtx.fillRect(0, 0, volumePer, 10);
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
    setVideo(youtubeId) {
        this.player.loadVideoById(youtubeId);
    }
    create() {
        return new Promise((resolve) => {
            window.onYouTubeIframeAPIReady = () => {
                this.player = new YT.Player("player", {
                    events: {
                        "onReady": () => {
                            resolve();
                        },
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
                <iframe id="player" width="${560}" height="${350}" class="youtube-iframe"
                src="https://www.youtube.com/embed/hoge?${param}"
                frameborder="0"></iframe>
            `);
            const youtubeContainer = document.querySelector(".youtube-container");
            youtubeContainer.appendChild(iframe);
        });
    }
}
class MelodyGuid {
    constructor() {
        const canvas = document.querySelector(".melody-guide");
        this.ctx = canvas.getContext("2d");
    }
    setTrack(track) {
        this.originRecords = track.tracks[0].notes;
        this.delay = track.delay;
        this.midiOffset = track.midiOffset;
    }
    start() {
        this.MicRecords = [];
        this.startTime = new Date();
    }
    addMicPitch(frequency) {
        const now = (new Date().getTime() - this.startTime.getTime()) / 1000;
        let micMidiNumber = util_1.AudioConvertUtil.frequencyToMidi(frequency);
        if (this.midiOffset > micMidiNumber) {
            micMidiNumber += 12;
            if (this.midiOffset > micMidiNumber) {
                micMidiNumber += 12;
            }
        }
        this.MicRecords.push({
            time: now,
            midi: micMidiNumber
        });
    }
    getNowMidi() {
        const now = (new Date().getTime() - this.startTime.getTime()) / 1000;
        const nowOrigin = this.originRecords.filter((block) => {
            return block.time <= (now - this.delay) && (now - this.delay) <= block.time + block.duration;
        });
        if (nowOrigin[0]) {
            return nowOrigin[0].midi;
        }
    }
    render() {
        this.ctx.clearRect(0, 0, const_1.CONST.MELODY_WIDTH, const_1.CONST.MELODY_HEIGHT);
        const now = (new Date().getTime() - this.startTime.getTime()) / 1000;
        const offsetSecond = Math.floor(now / const_1.CONST.BASE_SEC) * const_1.CONST.BASE_SEC;
        const turnMelodies = this.filterRange(this.originRecords, offsetSecond - this.delay);
        const turnMicRecords = this.filterRange(this.MicRecords, offsetSecond);
        for (const note of turnMelodies) {
            this.renderBlock(note.midi, note.time - offsetSecond + this.delay, note.duration);
        }
        for (const mic of turnMicRecords) {
            this.renderMic(mic.midi, mic.time - offsetSecond);
        }
        this.renderLine();
        this.renderNowTimeline(now - offsetSecond);
    }
    filterRange(blocks, offset) {
        return blocks.filter((block) => {
            return offset <= (block.time + (block.duration || 0)) &&
                block.time < offset + const_1.CONST.BASE_SEC;
        });
    }
    renderLine() {
        this.ctx.strokeStyle = "rgba(255,255,255,0.3)";
        this.ctx.lineWidth = 1.5;
        this.ctx.shadowColor = "rgba(255,255,255,0.8)";
        this.ctx.shadowBlur = 2;
        for (let i = 0; i <= const_1.CONST.MIDI_RANGE; i++) {
            let h = Math.floor(i * const_1.CONST.MELODY_HEIGHT / const_1.CONST.MIDI_RANGE) + 0.5;
            if (h > const_1.CONST.MELODY_HEIGHT) {
                h -= 0.5;
            }
            this.ctx.beginPath();
            this.ctx.moveTo(0, h);
            this.ctx.lineTo(const_1.CONST.MELODY_WIDTH, h);
            this.ctx.stroke();
        }
        this.ctx.shadowBlur = 0;
    }
    renderBlock(midiLevel, start, duration) {
        if (midiLevel < this.midiOffset ||
            this.midiOffset + const_1.CONST.MIDI_RANGE <= midiLevel) {
            return;
        }
        const width = duration / const_1.CONST.BASE_SEC * const_1.CONST.MELODY_WIDTH;
        const x = start / const_1.CONST.BASE_SEC * const_1.CONST.MELODY_WIDTH;
        const y = const_1.CONST.MELODY_HEIGHT - (midiLevel - this.midiOffset) / const_1.CONST.MIDI_RANGE * const_1.CONST.MELODY_HEIGHT + 0.5;
        const height = const_1.CONST.MELODY_HEIGHT / const_1.CONST.MIDI_RANGE - 0.5;
        this.ctx.fillStyle = "rgb(0, 253, 103)";
        // this.ctx.beginPath();
        // this.ctx.fillRect(x, y, width, height);
        this.fillRoundRect(x, y, width, height, 2);
    }
    fillRoundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.fill();
    }
    renderMic(midiLevel, start) {
        this.ctx.fillStyle = "rgba(255, 69, 205, 0.81)";
        const unitHeight = const_1.CONST.MELODY_HEIGHT / const_1.CONST.MIDI_RANGE;
        const unitWidth = const_1.CONST.MELODY_WIDTH / const_1.CONST.BASE_SEC / 30;
        const x = start / const_1.CONST.BASE_SEC * const_1.CONST.MELODY_WIDTH - unitWidth * 6;
        const y = const_1.CONST.MELODY_HEIGHT - (midiLevel - this.midiOffset) / const_1.CONST.MIDI_RANGE * const_1.CONST.MELODY_HEIGHT
            + unitHeight / 4;
        this.ctx.beginPath();
        this.ctx.fillRect(x, y, unitWidth, 2.5);
    }
    renderNowTimeline(time) {
        this.ctx.strokeStyle = "rgba(255,255,255,0.2)";
        this.ctx.lineWidth = 3;
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
        alert("ブラウザが対応してないかマイクがないからできないよ");
        throw error;
    }
}))();


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const const_1 = __webpack_require__(1);
const util_1 = __webpack_require__(0);
class AudioAnalyzer {
    constructor(stream) {
        this.recordeChunks = [];
        this.pitchRatio = 1;
        const audioElement = document.createElement("audio");
        audioElement.src = URL.createObjectURL(stream);
        const audioContext = new AudioContext();
        const BUFFER_SIZE = 2048;
        this.filter = audioContext.createScriptProcessor(BUFFER_SIZE);
        this.analyser = audioContext.createAnalyser();
        // const oscillator = audioContext.createOscillator();
        // oscillator.type = "sine";
        // oscillator.frequency.value = 440;
        // oscillator.start();
        this.frequency = new Uint8Array(this.analyser.frequencyBinCount);
        const microphoneNode = audioContext.createMediaStreamSource(stream);
        microphoneNode.connect(this.analyser);
        const streamDestination = audioContext.createMediaStreamDestination();
        this.analyser.connect(this.filter);
        this.filter.connect(streamDestination);
        // this.filter.connect(audioContext.destination);
        this.buffer = new Float32Array(BUFFER_SIZE * 2);
        this.grainWindow = this.hannWindow(BUFFER_SIZE);
        this.filter.onaudioprocess = (event) => {
            const inputData = event.inputBuffer.getChannelData(0);
            const outputData = event.outputBuffer.getChannelData(0);
            if (this.pitchRatio === 1) {
                inputData.forEach((value, i) => {
                    outputData[i] = value;
                });
                return;
            }
            for (let i = 0; i < inputData.length; i++) {
                inputData[i] *= this.grainWindow[i];
                this.buffer[i] = this.buffer[i + BUFFER_SIZE];
                this.buffer[i + BUFFER_SIZE] = 0.0;
            }
            const grainData = new Float32Array(BUFFER_SIZE * 2);
            for (let i = 0, j = 0.0; i < BUFFER_SIZE; i++, j += this.pitchRatio) {
                const index = Math.floor(j) % BUFFER_SIZE;
                const a = inputData[index];
                const b = inputData[(index + 1) % BUFFER_SIZE];
                grainData[i] += this.linearInterpolation(a, b, j % 1.0) * this.grainWindow[i];
            }
            for (let i = 0; i < BUFFER_SIZE; i += Math.round(BUFFER_SIZE * (1 - 0.5))) {
                for (let j = 0; j <= BUFFER_SIZE; j++) {
                    this.buffer[i + j] += grainData[j];
                }
            }
            for (let i = 0; i < BUFFER_SIZE; i++) {
                outputData[i] = this.buffer[i];
            }
        };
        this.recorder = new MediaRecorder(streamDestination.stream);
        this.recorder.addEventListener("dataavailable", (event) => {
            this.recordeChunks.push(event.data);
        });
    }
    hannWindow(length) {
        const array = new Float32Array(length);
        for (let i = 0; i < length; i++) {
            array[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)));
        }
        return array;
    }
    linearInterpolation(a, b, t) {
        return a + (b - a) * t;
    }
    setPitch(ratio) {
        this.pitchRatio = ratio;
    }
    startRecord() {
        this.recordeChunks = [];
        this.recorder.start();
    }
    stopRecord() {
        return new Promise(resolve => {
            this.recorder.onstop = (event) => {
                const audioBlob = new Blob(this.recordeChunks);
                const audioUrl = URL.createObjectURL(audioBlob);
                resolve(audioUrl);
            };
            this.recorder.stop();
        });
    }
    getFrameMicData() {
        this.analyser.getByteFrequencyData(this.frequency);
        return this.frequencyArrayToFrequency(this.frequency);
    }
    frequencyArrayToFrequency(frequencyArray) {
        const personVoiceFrequency = this.filterFrequency(frequencyArray);
        const averageMicVolume = util_1.MathUtil.average(personVoiceFrequency);
        let frequency;
        if (averageMicVolume > 10) {
            const squereFrequency = personVoiceFrequency.map((f) => f);
            const indexOfMaxValue = util_1.MathUtil.getIndexOfMaxValue(squereFrequency);
            // indexだけだと大雑把になるので線形補完
            const [y0, y1, y2] = squereFrequency.slice(indexOfMaxValue - 1, indexOfMaxValue + 2);
            const x1 = (y2 - y0) * 0.5 / (2 * y1 - y2 - y0);
            frequency = util_1.AudioConvertUtil.indexToFrequency(indexOfMaxValue + x1 + AudioAnalyzer.PERSON_MIN_INDEX);
        }
        return {
            frequency: frequency,
            volume: averageMicVolume
        };
    }
    filterFrequency(frequencyData) {
        const maxIndex = Math.floor(this.analyser.fftSize / 44100 * 3000);
        return frequencyData.slice(AudioAnalyzer.PERSON_MIN_INDEX, maxIndex);
    }
}
AudioAnalyzer.PERSON_MIN_INDEX = Math.floor(const_1.CONST.FFT / 44100 * const_1.CONST.MIC_FREQ_OFFSET);
exports.AudioAnalyzer = AudioAnalyzer;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __webpack_require__(0);
const observable_1 = __webpack_require__(2);
const silhouette_1 = __webpack_require__(7);
const futakotome_1 = __webpack_require__(8);
const trackTile_1 = __webpack_require__(9);
const scanner_1 = __webpack_require__(3);
const kiminosiranai_1 = __webpack_require__(11);
class SelectTrackView extends observable_1.Observable {
    get el() {
        return this._el;
    }
    constructor() {
        super();
        const tracks = [silhouette_1.silhouette, futakotome_1.futakotome, kiminosiranai_1.kiminosiranai];
        const trackParts = tracks.map((track) => {
            return new trackTile_1.TrackTileComponent({
                title: track.titie,
                coverImage: track.cover,
                onClick: () => {
                    this.trigger("select", track);
                }
            });
        });
        this._el = util_1.ElementUtil.builder(`
            <div class="select-track-view">
                ${trackParts.map((trackPart) => trackPart.html()).join("")}
            </div>
        `);
        scanner_1.ComponentScanner.scan(this._el);
    }
}
exports.SelectTrackView = SelectTrackView;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.silhouette = {
    "delay": 4.65,
    "youtubeId": "6h71uYUVRSg",
    "titie": "シルエット",
    "cover": "https://i1.sndcdn.com/artworks-000093734637-p2h4nv-t500x500.jpg",
    "midiOffset": 50,
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
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.futakotome = {
    "delay": 4.3,
    "youtubeId": "Ljt6Pl1baIY",
    "titie": "二言目",
    "cover": "http://tn.smilevideo.jp/smile?i=21435061.L",
    "midiOffset": 60,
    "tracks": [
        {
            "startTime": 7.846145999999999,
            "duration": 84.8768382000004,
            "length": 182,
            "notes": [
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 7.846145999999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4153842000000001
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 8.307684,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 8.538452999999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "C#5",
                    "midi": 73,
                    "time": 8.769221999999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 8.999990999999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6461532000000005
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 9.923066999999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 10.153835999999995,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 10.384604999999993,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 10.615373999999992,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "A5",
                    "midi": 81,
                    "time": 10.84614299999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 11.07691199999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 11.307680999999988,
                    "velocity": 0.6299212598425197,
                    "duration": 1.6153829999999996
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 15.230753999999987,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4153842000000001
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 15.692291999999988,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 15.923060999999986,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "C#5",
                    "midi": 73,
                    "time": 16.153829999999985,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 16.384598999999984,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6461532000000005
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 17.307674999999985,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 17.538443999999984,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 17.769212999999983,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 17.99998199999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "A5",
                    "midi": 81,
                    "time": 18.23075099999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 18.46151999999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 18.692288999999978,
                    "velocity": 0.6299212598425197,
                    "duration": 1.4769216000000007
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 22.615361999999976,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4153841999999983
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 23.076899999999974,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 23.307668999999972,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "C#5",
                    "midi": 73,
                    "time": 23.53843799999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 23.76920699999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6461532000000005
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 24.69228299999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 24.92305199999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 25.15382099999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 25.384589999999967,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "A5",
                    "midi": 81,
                    "time": 25.615358999999966,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 25.846127999999965,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 26.076896999999963,
                    "velocity": 0.6299212598425197,
                    "duration": 1.4769216000000007
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 29.769200999999963,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 29.999969999999962,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 30.23073899999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 30.46150799999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 30.692276999999958,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "C#5",
                    "midi": 73,
                    "time": 30.923045999999957,
                    "velocity": 0.6299212598425197,
                    "duration": 0.20769209999999916
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 31.153814999999955,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6461532000000005
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 32.076890999999954,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "B5",
                    "midi": 83,
                    "time": 32.307659999999956,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "A5",
                    "midi": 81,
                    "time": 32.53842899999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 32.76919799999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "A5",
                    "midi": 81,
                    "time": 32.99996699999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 33.230735999999965,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 33.46150499999997,
                    "velocity": 0.6299212598425197,
                    "duration": 1.4769215999999972
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 36.69227099999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 36.923039999999965,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 37.15380899999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 37.61534699999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 37.846115999999974,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 38.076884999999976,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 38.53842299999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 38.76919199999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 38.999960999999985,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 39.46149899999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 39.69226799999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 39.923036999999994,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 40.384575,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 40.615344,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 40.846113,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 41.30765100000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 41.53842000000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 41.76918900000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 42.230727000000016,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 42.46149600000002,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 42.69226500000002,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 43.153803000000025,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 43.38457200000003,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 43.61534100000003,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 44.076879000000034,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 44.307648000000036,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 44.53841700000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 44.99995500000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 45.230724000000045,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 45.46149300000005,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 45.92303100000005,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 46.153800000000054,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 46.384569000000056,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 46.84610700000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 47.07687600000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 47.307645000000065,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 47.76918300000007,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 47.99995200000007,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 48.230721000000074,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 48.69225900000008,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 48.92302800000008,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 49.15379700000008,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 49.61533500000009,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 49.84610400000009,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 50.07687300000009,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 50.538411000000096,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 50.7691800000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 50.9999490000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 51.461487000000105,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 51.69225600000011,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 51.92302500000011,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 52.15379400000011,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 52.384563000000114,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 52.615332000000116,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 52.84610100000012,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 53.07687000000012,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 53.30763900000012,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 53.538408000000125,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 53.76917700000013,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 53.99994600000013,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 54.23071500000013,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 54.461484000000134,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 54.692253000000136,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 54.92302200000014,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 55.15379100000014,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 55.38456000000014,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4153841999999983
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 55.84609800000014,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 56.07686700000014,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4384610999999978
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 56.53840500000014,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4384610999999978
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 56.99994300000014,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4384610999999978
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 57.461481000000134,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 57.692250000000136,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 57.92301900000014,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6461532000000005
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 58.84609500000014,
                    "velocity": 0.6299212598425197,
                    "duration": 0.10384605000000136
                },
                {
                    "name": "A5",
                    "midi": 81,
                    "time": 58.961479500000145,
                    "velocity": 0.6299212598425197,
                    "duration": 0.10384605000000136
                },
                {
                    "name": "B5",
                    "midi": 83,
                    "time": 59.07686400000015,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 59.30763300000015,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 59.538402000000154,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "B5",
                    "midi": 83,
                    "time": 59.769171000000156,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 59.99994000000016,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 60.23070900000016,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 60.692247000000165,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4384610999999978
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 61.15378500000016,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 61.384554000000165,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "A5",
                    "midi": 81,
                    "time": 61.61532300000017,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 61.84609200000017,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4153841999999983
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 62.30763000000017,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4153841999999983
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 62.769168000000164,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4153841999999983
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 63.23070600000016,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 63.46147500000016,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4384610999999978
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 63.92301300000016,
                    "velocity": 0.6299212598425197,
                    "duration": 0.43846110000000493
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 64.38455100000017,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4384610999999978
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 64.84608900000018,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 65.07685800000019,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 65.3076270000002,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6461532000000005
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 66.23070300000019,
                    "velocity": 0.6299212598425197,
                    "duration": 0.10384605000000136
                },
                {
                    "name": "A5",
                    "midi": 81,
                    "time": 66.3460875000002,
                    "velocity": 0.6299212598425197,
                    "duration": 0.10384605000000136
                },
                {
                    "name": "B5",
                    "midi": 83,
                    "time": 66.4614720000002,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 66.69224100000021,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 66.92301000000022,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "C#6",
                    "midi": 85,
                    "time": 67.15377900000023,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 67.38454800000024,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 67.61531700000025,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 68.07685500000025,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4384610999999978
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 68.53839300000026,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 68.76916200000026,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "A5",
                    "midi": 81,
                    "time": 68.99993100000027,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "B5",
                    "midi": 83,
                    "time": 69.23070000000028,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4153842000000054
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 69.69223800000029,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4153842000000054
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 70.15377600000029,
                    "velocity": 0.6299212598425197,
                    "duration": 1.246152600000002
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 71.7691590000003,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 71.99992800000031,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4153842000000054
                },
                {
                    "name": "A5",
                    "midi": 81,
                    "time": 72.46146600000031,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 72.69223500000032,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4384610999999978
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 73.15377300000033,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4384610999999978
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 73.61531100000033,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4384610999999978
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 74.07684900000034,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6461532000000005
                },
                {
                    "name": "D#5",
                    "midi": 75,
                    "time": 74.76915600000034,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 74.99992500000035,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4384610999999978
                },
                {
                    "name": "B5",
                    "midi": 83,
                    "time": 75.46146300000035,
                    "velocity": 0.6299212598425197,
                    "duration": 1.8923058000000026
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 77.99992200000035,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 78.23069100000036,
                    "velocity": 0.6299212598425197,
                    "duration": 0.10384605000000136
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 78.34607550000037,
                    "velocity": 0.6299212598425197,
                    "duration": 0.32307659999999316
                },
                {
                    "name": "A5",
                    "midi": 81,
                    "time": 78.69222900000037,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "B5",
                    "midi": 83,
                    "time": 78.92299800000038,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "B5",
                    "midi": 83,
                    "time": 79.15376700000039,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4384610999999978
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 79.61530500000039,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4384610999999978
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 80.30761200000039,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4153842000000054
                },
                {
                    "name": "G#5",
                    "midi": 80,
                    "time": 80.7691500000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4153842000000054
                },
                {
                    "name": "F#5",
                    "midi": 78,
                    "time": 81.2306880000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.4153842000000054
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 81.6922260000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.2076921000000027
                },
                {
                    "name": "E5",
                    "midi": 76,
                    "time": 81.92299500000041,
                    "velocity": 0.6299212598425197,
                    "duration": 2.9538431999999943
                }
            ],
            "controlChanges": {
                "10": [
                    {
                        "number": 10,
                        "time": 0,
                        "value": 0.5039370078740157
                    }
                ]
            },
            "id": 1,
            "name": "Piano",
            "instrumentNumber": 0,
            "instrument": "acoustic grand piano",
            "instrumentFamily": "piano",
            "channelNumber": 0,
            "isPercussion": false
        }
    ]
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const baseComponent_1 = __webpack_require__(10);
const util_1 = __webpack_require__(0);
class TrackTileComponent extends baseComponent_1.BaseComponent {
    /** @override */
    html() {
        return `
		<div
			class="track-tile-component ${this.getClassNames()}"
			${this.htmlAttr()}
		>
            <div class="track-cover-container">
                <img class="track-cover" src="${this.option.coverImage}">
                <button class="play-button">
                    ${util_1.ElementUtil.getSvgIcon("icon-play", "32")}
                </button>
            </div>
            <div class="track-title">${this.option.title}</div>
		</div>
		`;
    }
    /** @override */
    initElem(elem, option) {
        elem.querySelector(".play-button").addEventListener("click", () => option.onClick(this));
    }
    toggleActive(toggel) {
        this.element.classList.toggle("active", toggel);
    }
}
exports.TrackTileComponent = TrackTileComponent;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const observable_1 = __webpack_require__(2);
const scanner_1 = __webpack_require__(3);
class BaseComponent extends observable_1.Observable {
    constructor(option) {
        super();
        this._option = option;
        this._argClassName = option.className;
        this._id = scanner_1.ComponentScanner.register(this, option);
    }
    get element() {
        return this._element;
    }
    /** initElement後はnullになる */
    get option() {
        return this._option;
    }
    preInitElem(element) {
        this._option = null;
        this._element = element;
    }
    getClassNames() {
        return `my-component ${this._argClassName || ""}`;
    }
    htmlAttr() {
        return `component-id="${this._id}" `;
    }
}
exports.BaseComponent = BaseComponent;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.kiminosiranai = {
    "delay": 1.2,
    "youtubeId": "wfkgRfBUWLo",
    "titie": "君の知らない物語",
    "cover": "https://images-na.ssl-images-amazon.com/images/I/61qqNljoiPL._SX355_.jpg",
    "midiOffset": 54,
    "tracks": [
        {
            "startTime": 17.454528,
            "duration": 85.73552032499997,
            "length": 146,
            "notes": [
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 17.454528,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 17.636346,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 17.818164,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 17.999982,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 18.1818,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 18.363618,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 18.545436,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 18.727254,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 18.909072,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 19.090889999999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 19.272707999999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 19.454525999999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.344696625000001
                },
                {
                    "name": "B3",
                    "midi": 59,
                    "time": 19.818161999999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.344696625000001
                },
                {
                    "name": "B3",
                    "midi": 59,
                    "time": 20.181797999999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 20.363615999999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 20.545433999999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 20.727251999999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 20.909069999999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 21.090887999999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 21.272705999999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 21.454523999999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 21.636341999999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 21.818159999999995,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 21.999977999999995,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 22.181795999999995,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 22.363613999999995,
                    "velocity": 0.6299212598425197,
                    "duration": 0.344696625000001
                },
                {
                    "name": "B3",
                    "midi": 59,
                    "time": 22.727249999999994,
                    "velocity": 0.6299212598425197,
                    "duration": 0.5174237250000004
                },
                {
                    "name": "A3",
                    "midi": 57,
                    "time": 23.272703999999994,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6901508249999999
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 23.999975999999993,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6901508249999999
                },
                {
                    "name": "G#4",
                    "midi": 68,
                    "time": 24.727247999999992,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6901508249999999
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 25.45451999999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.5174237250000004
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 25.99997399999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 26.18179199999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.8628779249999994
                },
                {
                    "name": "G#4",
                    "midi": 68,
                    "time": 27.09088199999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 27.27269999999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 27.45451799999999,
                    "velocity": 0.6299212598425197,
                    "duration": 1.5537863250000008
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 29.09087999999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.344696625000001
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 29.45451599999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 29.63633399999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 29.81815199999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 29.99996999999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 30.18178799999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 30.36360599999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 30.54542399999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 30.72724199999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 30.90905999999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 31.09087799999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.344696625000001
                },
                {
                    "name": "B3",
                    "midi": 59,
                    "time": 31.45451399999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.344696625000001
                },
                {
                    "name": "B3",
                    "midi": 59,
                    "time": 31.81814999999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 31.99996799999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 32.18178599999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 32.36360399999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 32.54542199999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 32.72723999999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 32.90905799999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 33.09087599999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 33.27269399999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 33.45451199999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "B3",
                    "midi": 59,
                    "time": 33.63632999999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "B3",
                    "midi": 59,
                    "time": 33.81814799999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "B3",
                    "midi": 59,
                    "time": 33.999965999999986,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "A3",
                    "midi": 57,
                    "time": 34.363601999999986,
                    "velocity": 0.6299212598425197,
                    "duration": 0.5174237250000004
                },
                {
                    "name": "A3",
                    "midi": 57,
                    "time": 34.909055999999985,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6901508250000035
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 35.63632799999999,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6901508250000035
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 36.3636,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6901508250000035
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 37.090872000000005,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6901508250000035
                },
                {
                    "name": "B3",
                    "midi": 59,
                    "time": 37.81814400000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6901508250000035
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 38.54541600000002,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6901508250000035
                },
                {
                    "name": "B3",
                    "midi": 59,
                    "time": 39.272688000000024,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6901508250000035
                },
                {
                    "name": "A3",
                    "midi": 57,
                    "time": 39.99996000000003,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6901508250000035
                },
                {
                    "name": "A3",
                    "midi": 57,
                    "time": 40.727232000000036,
                    "velocity": 0.6299212598425197,
                    "duration": 1.3810592250000013
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 43.27268400000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 43.63632000000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "G#4",
                    "midi": 68,
                    "time": 43.99995600000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 44.36359200000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 44.72722800000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6901508250000035
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 45.454500000000046,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 45.818136000000045,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 46.181772000000045,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 46.545408000000045,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "A3",
                    "midi": 57,
                    "time": 46.909044000000044,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "A3",
                    "midi": 57,
                    "time": 47.272680000000044,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "D4",
                    "midi": 62,
                    "time": 47.63631600000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6901508250000035
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 48.36358800000005,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "A3",
                    "midi": 57,
                    "time": 48.72722400000005,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6901508250000035
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 49.454496000000056,
                    "velocity": 0.6299212598425197,
                    "duration": 1.3810592250000013
                },
                {
                    "name": "G#4",
                    "midi": 68,
                    "time": 50.909040000000054,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6901508250000035
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 51.63631200000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.6901508250000035
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 52.36358400000007,
                    "velocity": 0.6299212598425197,
                    "duration": 1.0356050250000024
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 53.454492000000066,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 53.636310000000066,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "C#5",
                    "midi": 73,
                    "time": 53.818128000000065,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 54.181764000000065,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "D5",
                    "midi": 74,
                    "time": 54.363582000000065,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "C#5",
                    "midi": 73,
                    "time": 54.727218000000065,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 55.090854000000064,
                    "velocity": 0.6299212598425197,
                    "duration": 1.2083321249999983
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 56.36358000000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "D5",
                    "midi": 74,
                    "time": 56.72721600000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "C#5",
                    "midi": 73,
                    "time": 57.09085200000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 57.27267000000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 57.63630600000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 57.99994200000006,
                    "velocity": 0.6299212598425197,
                    "duration": 1.2083321249999983
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 59.27266800000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "C#5",
                    "midi": 73,
                    "time": 59.63630400000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 59.99994000000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695250000015
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 60.18175800000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "G#4",
                    "midi": 68,
                    "time": 60.54539400000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 60.90903000000006,
                    "velocity": 0.6299212598425197,
                    "duration": 2.2446947250000022
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 63.27266400000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 63.63630000000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "C#5",
                    "midi": 73,
                    "time": 63.99993600000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.5174237250000004
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 64.54539000000007,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695249999944
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 64.72720800000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.5174237250000004
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 65.27266200000007,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695249999944
                },
                {
                    "name": "D5",
                    "midi": 74,
                    "time": 65.45448000000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.5174237250000004
                },
                {
                    "name": "D5",
                    "midi": 74,
                    "time": 65.99993400000007,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695249999944
                },
                {
                    "name": "C#5",
                    "midi": 73,
                    "time": 66.18175200000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 66.54538800000006,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695249999944
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 66.72720600000005,
                    "velocity": 0.6299212598425197,
                    "duration": 1.2083321249999983
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 67.99993200000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "D5",
                    "midi": 74,
                    "time": 68.36356800000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "C#5",
                    "midi": 73,
                    "time": 68.72720400000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695249999944
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 68.90902200000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 69.27265800000004,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 69.63629400000003,
                    "velocity": 0.6299212598425197,
                    "duration": 1.2083321249999983
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 70.90902000000003,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695249999944
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 71.09083800000002,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695249999944
                },
                {
                    "name": "C#5",
                    "midi": 73,
                    "time": 71.27265600000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 71.63629200000001,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695249999944
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 71.81811,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "G#4",
                    "midi": 68,
                    "time": 72.181746,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "F#4",
                    "midi": 66,
                    "time": 72.545382,
                    "velocity": 0.6299212598425197,
                    "duration": 1.2083321249999983
                },
                {
                    "name": "C#4",
                    "midi": 61,
                    "time": 73.818108,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "G#4",
                    "midi": 68,
                    "time": 74.181744,
                    "velocity": 0.6299212598425197,
                    "duration": 1.0356050249999953
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 75.272652,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695249999944
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 75.45446999999999,
                    "velocity": 0.6299212598425197,
                    "duration": 1.2083321249999983
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 76.72719599999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 77.09083199999998,
                    "velocity": 0.6299212598425197,
                    "duration": 1.0356050249999953
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 78.18173999999998,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695249999944
                },
                {
                    "name": "C#5",
                    "midi": 73,
                    "time": 78.36355799999997,
                    "velocity": 0.6299212598425197,
                    "duration": 3.971965725000004
                },
                {
                    "name": "E4",
                    "midi": 64,
                    "time": 82.54537199999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 82.90900799999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "G#4",
                    "midi": 68,
                    "time": 83.27264399999997,
                    "velocity": 0.6299212598425197,
                    "duration": 0.1719695249999944
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 83.45446199999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "B4",
                    "midi": 71,
                    "time": 83.81809799999996,
                    "velocity": 0.6299212598425197,
                    "duration": 0.3446966249999974
                },
                {
                    "name": "A4",
                    "midi": 69,
                    "time": 84.18173399999996,
                    "velocity": 0.6299212598425197,
                    "duration": 1.5537863250000044
                }
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
            "instrumentNumber": 0,
            "instrument": "acoustic grand piano",
            "instrumentFamily": "piano",
            "channelNumber": 0,
            "isPercussion": false
        }
    ]
};


/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = "<svg style=\"display:none\" width=\"580\" height=\"400\" \r\n    xmlns=\"http://www.w3.org/2000/svg\">\r\n    <defs>\r\n        <symbol id=\"icon-information\" viewBox=\"0 0 24 24\" fill=\"#7698b3\">\r\n            <path d=\"M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z\" />\r\n        </symbol>\r\n        <symbol id=\"icon-sort\" viewBox=\"0 0 24 24\">\r\n            <path d=\"M10,13V11H18V13H10M10,19V17H14V19H10M10,7V5H22V7H10M6,17H8.5L5,20.5L1.5,17H4V7H1.5L5,3.5L8.5,7H6V17Z\" />\r\n        </symbol>\r\n        <symbol id=\"icon-play\" viewBox=\"0 0 24 24\">\r\n            <path d=\"M8,5.14V19.14L19,12.14L8,5.14Z\" />\r\n        </symbol>\r\n    </defs>\r\n</svg>\r\n"

/***/ })
/******/ ]);
//# sourceMappingURL=app.js.map