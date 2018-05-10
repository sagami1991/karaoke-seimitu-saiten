import { CONST } from "./const";
import { AudioConvertUtil, MathUtil, ElementUtil } from "./util";
import { AudioAnalyzer } from "./AudioAnalyzer";
import { SelectTrackView } from "./selectTrackView";
import { IPitchBlock, ITrack } from "./interface";
declare const require: any;

class Application {
    private melodyGuid: MelodyGuid;
    private stopButton: HTMLButtonElement;
    private startButton: HTMLButtonElement;
    private micFrequencyElement: HTMLElement;
    private youtube: YoutubeAPI;
    private audioAnalyzer!: AudioAnalyzer;
    private volumeUI: VolumeUI;

    constructor() {
        this.melodyGuid = new MelodyGuid();
        this.stopButton = document.querySelector(".stop-button") as HTMLButtonElement;
        this.startButton = document.querySelector(".start-button") as HTMLButtonElement;
        this.micFrequencyElement = document.querySelector(".mic-frequency") as HTMLButtonElement;
        this.startButton.disabled = true;
        this.stopButton.disabled = true;
        this.startButton.addEventListener("click", () => {
            this.start();
        });
        this.stopButton.addEventListener("click", () => {
            this.stop();
            this.frame();
        });
        this.youtube = new YoutubeAPI();
        this.volumeUI = new VolumeUI();
        this.appendInlineSvg();
    }

    public async main() {
        const selectTrackView = new SelectTrackView();
        await this.youtube.create();
        const stream = await this.permissionMicInput();
        this.audioAnalyzer = new AudioAnalyzer(stream);
        this.startButton.disabled = false;
        let intervalId: number = 0;
        selectTrackView.addListener("select", "1", (track) => {
            this.changeTrack(track);
            this.start();
        });
        document.querySelector(".track-select-container")!.appendChild(selectTrackView.el);

        this.youtube.setStateChangeListener((state) => {
            switch (state) {
                case YT.PlayerState.PLAYING:
                    this.startButton.disabled = true;
                    this.stopButton.disabled = false;
                    this.melodyGuid.start();
                    intervalId = setInterval(() => {
                        this.frame();
                        this.melodyGuid.frame();
                    }, 1000 / CONST.FPS);
                    break;
                case YT.PlayerState.PAUSED:
                case YT.PlayerState.ENDED:
                    clearInterval(intervalId);
                    this.stop();
                    break;
            }
        });
    }

    private appendInlineSvg() {
        const svgText = require("./resource/iconset.svg") as string;
        const svgContainer = document.querySelector(".svg-container")!;
        svgContainer.innerHTML = svgText;
    }

    private async changeTrack(track: ITrack) {
        this.youtube.setVideo(track.youtubeId);
        this.melodyGuid.setTrack(track);
    }

    public start() {
        this.startButton.disabled = true;
        this.youtube.start();
    }

    public stop() {
        this.stopButton.disabled = true;
        this.startButton.disabled = false;
        this.youtube.stop();
    }

    private frame() {
        const micData = this.audioAnalyzer.getFrameMicData();
        if (micData.frequency) {
            this.melodyGuid.addMicPitch(micData.frequency);
            this.micFrequencyElement.textContent = `マイク音程: ${micData.frequency}Hz`;
        }
        this.volumeUI.render(micData.volume);
    }

    private async permissionMicInput(): Promise<MediaStream> {
        navigator.getUserMedia = navigator.getUserMedia ||
            (navigator as any).webkitGetUserMedia ||
            (navigator as any).mozGetUserMedia ||
            (navigator as any).msGetUserMedia;
        return new Promise<MediaStream>((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({
                audio: true
            }).then((stream) => resolve(stream))
                .catch((reason) => reject(reason));
        });
    }
}

class VolumeUI {
    private volumeCtx: CanvasRenderingContext2D;

    constructor() {
        const canvas = document.querySelector(".volume-meter") as HTMLCanvasElement;
        this.volumeCtx = canvas.getContext("2d")!;
    }
    public render(volume: number) {
        this.volumeCtx.clearRect(0, 0, 200, 100);
        this.volumeCtx.fillStyle = "blue";
        this.volumeCtx.beginPath();
        const volumePer = Math.floor(volume / 255 * 200);
        this.volumeCtx.fillRect(0, 0, volumePer, 10);
    }
}

class YoutubeAPI {
    private stateChange!: (state: 1 | 2) => void;
    private player!: YT.Player;

    public setStateChangeListener(func: (state: 1 | 2) => void) {
        this.stateChange = func;
    }

    public start() {
        this.player.playVideo();
    }

    public stop() {
        this.player.stopVideo();
    }

    public setVideo(youtubeId: string) {
        this.player.loadVideoById(youtubeId);
    }

    public create(): Promise<void> {
        return new Promise((resolve) => {
            (window as any).onYouTubeIframeAPIReady = () => {
                this.player = new YT.Player("player", {
                    events: {
                        "onReady": () => {
                            console.log("ready");
                            resolve();
                        },
                        "onStateChange": (e) => {
                            this.stateChange(e.data as (1 | 2));
                            console.log("a")
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
            const iframe = ElementUtil.builder(`
                <iframe id="player" width="${560}" height="${315}"
                src="https://www.youtube.com/embed/hoge?${param}"
                frameborder="0"></iframe>
            `);
            const youtubeContainer = document.querySelector(".youtube-container") as HTMLElement;
            youtubeContainer.appendChild(iframe);
        });
    }
}

class MelodyGuid {
    private ctx: CanvasRenderingContext2D;
    private okusitaElement: HTMLElement;
    private startTime!: Date;
    private MicRecords!: IPitchBlock[];
    private originRecords!: IPitchBlock[];
    private midiOffset!: number;
    private delay!: number;
    constructor() {
        this.okusitaElement = document.querySelector(".octabe") as HTMLElement;
        const canvas = document.querySelector(".melody-guide") as HTMLCanvasElement;
        this.ctx = canvas.getContext("2d")!;
    }

    public setTrack(track: ITrack) {
        this.originRecords = track.tracks[0].notes;
        this.delay = track.delay;
        this.midiOffset = track.midiOffset;
    }

    public start() {
        this.MicRecords = [];
        this.startTime = new Date();
    }

    public addMicPitch(frequency: number) {
        const now = (new Date().getTime() - this.startTime.getTime()) / 1000;
        let midi = AudioConvertUtil.frequencyToMidi(frequency);
        if (60 > midi) {
            midi += 12;
            if (60 - 12 > midi) {
                midi += 12;
            }
            this.okusitaElement.textContent = "オク下である";
        } else {
            this.okusitaElement.textContent = "オク下でない";
        }
        this.MicRecords.push({
            time: now,
            midi: midi
        });
    }

    public frame() {
        this.ctx.clearRect(0, 0, CONST.MELODY_WIDTH, CONST.MELODY_HEIGHT);
        const now = (new Date().getTime() - this.startTime.getTime()) / 1000;
        const offsetSecond = Math.floor(now / CONST.BASE_SEC) * CONST.BASE_SEC;
        const turnMelodies = this.filterRange(this.originRecords, offsetSecond - this.delay);
        const turnMicRecords = this.filterRange(this.MicRecords, offsetSecond);
        for (const note of turnMelodies) {
            this.renderBlock(note.midi, note.time - offsetSecond + this.delay, note.duration!);
        }
        for (const mic of turnMicRecords) {
            this.renderMic(mic.midi, mic.time - offsetSecond);
        }
        this.renderLine();
        this.renderNowTimeline(now - offsetSecond);
    }

    private filterRange(blocks: IPitchBlock[], offset: number) {
        return blocks.filter((block) => {
            return offset <= (block.time + (block.duration || 0)) &&
                 block.time < offset + CONST.BASE_SEC;
        });
    }

    private renderLine() {
        this.ctx.strokeStyle = "black";
        for (let i = 0; i <= CONST.MIDI_RANGE; i++) {
            this.ctx.lineWidth = 1;
            const h = Math.floor(i * CONST.MELODY_HEIGHT / CONST.MIDI_RANGE) + 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(0, h);
            this.ctx.lineTo(CONST.MELODY_WIDTH, h);
            this.ctx.stroke();
        }
    }

    private renderBlock(midiLevel: number, start: number, duration: number) {
        if (midiLevel < this.midiOffset ||
            this.midiOffset + CONST.MIDI_RANGE <= midiLevel) {
            return;
        }
        const width = duration / CONST.BASE_SEC * CONST.MELODY_WIDTH;
        const x = start / CONST.BASE_SEC * CONST.MELODY_WIDTH;
        const y = CONST.MELODY_HEIGHT - (midiLevel - this.midiOffset) / CONST.MIDI_RANGE * CONST.MELODY_HEIGHT;
        const height = CONST.MELODY_HEIGHT / CONST.MIDI_RANGE;
        this.ctx.fillStyle = "green";
        this.ctx.beginPath();
        this.ctx.fillRect(x, y, width, height);

    }

    private renderMic(midiLevel: number, start: number) {
        this.ctx.fillStyle = "red";
        const unitHeight = CONST.MELODY_HEIGHT / CONST.MIDI_RANGE;
        const unitWidth = CONST.MELODY_WIDTH / CONST.BASE_SEC / 30;
        const x = start / CONST.BASE_SEC * CONST.MELODY_WIDTH - unitWidth * 6;
        const y = CONST.MELODY_HEIGHT - (midiLevel - this.midiOffset) / CONST.MIDI_RANGE * CONST.MELODY_HEIGHT
            + unitHeight / 4;
        this.ctx.beginPath();
        this.ctx.fillRect(x, y, unitWidth, unitHeight / 2);
    }

    private renderNowTimeline(time: number) {
        this.ctx.strokeStyle = "blue";
        this.ctx.beginPath();
        this.ctx.moveTo(time / CONST.BASE_SEC * CONST.MELODY_WIDTH, 0);
        this.ctx.lineTo(time / CONST.BASE_SEC * CONST.MELODY_WIDTH, CONST.MELODY_HEIGHT);
        this.ctx.stroke();
    }
}

(async () => {
    try {
        await new Application().main();
    } catch (error) {
        alert("ブラウザが対応してないかマイクがないからできないよ");
        throw error;
    }
})();
