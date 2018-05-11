import { CONST } from "./const";
import { MathUtil, AudioConvertUtil } from "./util";

declare class MediaRecorder {
    constructor(stream: MediaStream);
    public addEventListener: Function;
    public start: (sec?: number) => void;
    public stop: () => void;
    public onstop: any;
}

export class AudioAnalyzer {
    private analyser: AnalyserNode;
    private frequency: Uint8Array;
    private recorder: MediaRecorder;
    private recordeChunks: Blob[] = [];
    private filter: ScriptProcessorNode;
    private buffer: Float32Array;
    private grainWindow: Float32Array;
    private pitchRatio = 1;
    private static PERSON_MIN_INDEX = Math.floor(CONST.FFT / 44100 * CONST.MIC_FREQ_OFFSET);
    constructor(stream: MediaStream) {
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
        const streamDestination = (audioContext as any).createMediaStreamDestination();
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
            for (let i = 0, j = 0.0;
                 i < BUFFER_SIZE;
                 i++, j += this.pitchRatio) {
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
        this.recorder.addEventListener("dataavailable", (event: any) => {
            this.recordeChunks.push(event.data);
        });
    }

    private hannWindow(length: number) {
        const array = new Float32Array(length);
        for (let i = 0; i < length; i++) {
            array[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)));
        }
        return array;
    }

    private linearInterpolation(a: number, b: number, t: number) {
        return a + (b - a) * t;
    }

    public setPitch(ratio: number) {
        this.pitchRatio = ratio;
    }

    public startRecord() {
        this.recordeChunks = [];
        this.recorder.start();
    }

    public stopRecord() {
        return new Promise<string>(resolve => {
            this.recorder.onstop = (event: any) => {
                const audioBlob = new Blob(this.recordeChunks);
                const audioUrl = URL.createObjectURL(audioBlob);
                resolve(audioUrl);
            };
            this.recorder.stop();
        });
    }

    public getFrameMicData(): {frequency?: number, volume: number} {
        this.analyser.getByteFrequencyData(this.frequency);
        return this.frequencyArrayToFrequency(this.frequency);
    }

    private frequencyArrayToFrequency(frequencyArray: Uint8Array) {
        const personVoiceFrequency = this.filterFrequency(frequencyArray);
        const averageMicVolume = MathUtil.average(personVoiceFrequency);
        let frequency: number | undefined;
        if (averageMicVolume > 10) {
            const squereFrequency = personVoiceFrequency.map((f) => f);
            const indexOfMaxValue = MathUtil.getIndexOfMaxValue(squereFrequency);
            // indexだけだと大雑把になるので線形補完
            const [y0, y1, y2] = squereFrequency.slice(indexOfMaxValue - 1, indexOfMaxValue + 2);
            const x1 = (y2 - y0) * 0.5 / (2 * y1 - y2 - y0);
            frequency = AudioConvertUtil.indexToFrequency(indexOfMaxValue + x1 + AudioAnalyzer.PERSON_MIN_INDEX);
        }
        return {
            frequency: frequency,
            volume: averageMicVolume
        };
    }

    private filterFrequency(frequencyData: Uint8Array): Uint8Array {
        const maxIndex = Math.floor(this.analyser.fftSize / 44100 * 3000);
        return frequencyData.slice(AudioAnalyzer.PERSON_MIN_INDEX, maxIndex);
    }
}
