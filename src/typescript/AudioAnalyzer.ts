import { CONST } from "./const";
import { MathUtil, AudioConvertUtil } from "./util";

export class AudioAnalyzer {
    private analyser: AnalyserNode;
    private frequency: Uint8Array;
    private static PERSON_MIN_INDEX = Math.floor(CONST.FFT / 44100 * CONST.MIC_FREQ_OFFSET);

    constructor(stream: MediaStream) {
        const audioElement = document.createElement("audio");
        audioElement.src = URL.createObjectURL(stream);
        const audioContext = new AudioContext();
        this.analyser = audioContext.createAnalyser();
        this.frequency = new Uint8Array(this.analyser.frequencyBinCount);
        audioContext.createMediaStreamSource(stream).connect(this.analyser);
    }

    public getFrameMicData(): {frequency?: number, volume: number} {
        this.analyser.getByteFrequencyData(this.frequency);
        const personVoiceFrequency = this.filterFrequency(this.frequency);
        const averageMicVolume = MathUtil.average(personVoiceFrequency);
        let frequency: number | undefined;
        if (averageMicVolume > 20) {
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