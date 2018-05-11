import { CONST } from "./const";
import { AudioConvertUtil, MathUtil, ElementUtil } from "./util";
import { AudioAnalyzer } from "./AudioAnalyzer";
import { SelectTrackView } from "./selectTrackView";
import { IPitchBlock, ITrack } from "./interface";
declare const require: any;

class Application {
    private melodyGuid: MelodyGuid;
    private stopButton: HTMLButtonElement;
    private youtube: YoutubeAPI;
    private audioAnalyzer!: AudioAnalyzer;
    private volumeUI: VolumeUI;
    private playMode: "STOP" | "PLAYING";
    private downloadLink: HTMLLinkElement;
    constructor() {
        this.melodyGuid = new MelodyGuid();
        this.stopButton = document.querySelector(".stop-button") as HTMLButtonElement;
        this.stopButton.disabled = true;
        this.stopButton.addEventListener("click", () => {
            this.stop();
            this.frame();
        });
        this.youtube = new YoutubeAPI();
        this.volumeUI = new VolumeUI();
        this.appendInlineSvg();
        this.playMode = "STOP";
        this.downloadLink = document.querySelector(".download") as HTMLLinkElement;
    }

    public async main() {
        const selectTrackView = new SelectTrackView();
        await this.youtube.create();
        const stream = await this.permissionMicInput();
        this.audioAnalyzer = new AudioAnalyzer(stream);
        let intervalId: number = 0;
        selectTrackView.addListener("select", "1", (track) => {
            this.stop();
            this.changeTrack(track);
        });
        document.querySelector(".track-select-container")!.appendChild(selectTrackView.el);

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

    private start() {
        this.playMode = "PLAYING";
        this.downloadLink.style.display = "none";
        this.stopButton.disabled = false;
        this.melodyGuid.start();
        this.audioAnalyzer.startRecord();
        return setInterval(() => {
            this.frame();
        }, 1000 / CONST.FPS);
    }

    public async stop() {
        if (this.playMode === "STOP") {
            return;
        }
        this.playMode = "STOP";
        this.stopButton.disabled = true;
        this.youtube.stop();
        const audioUrl = await this.audioAnalyzer.stopRecord();
        this.downloadLink.style.display = "block";
        this.downloadLink.href = audioUrl;
    }

    private frame() {
        const micData = this.audioAnalyzer.getFrameMicData();
        if (micData.frequency) {
            this.melodyGuid.addMicPitch(micData.frequency);
            const nowMidi = this.melodyGuid.getNowMidi();
            if (nowMidi) {
                const pitch = AudioConvertUtil.MidiToFrequency(nowMidi) / micData.frequency;
                console.log(pitch);
                this.audioAnalyzer.setPitch(pitch);
            } else {
                this.audioAnalyzer.setPitch(1);
            }
        } else {
            this.audioAnalyzer.setPitch(1);
        }
        this.volumeUI.render(micData.volume);
        this.melodyGuid.render();
    }

    private permissionMicInput(): Promise<MediaStream> {
        navigator.getUserMedia = navigator.getUserMedia ||
            (navigator as any).webkitGetUserMedia ||
            (navigator as any).mozGetUserMedia ||
            (navigator as any).msGetUserMedia;
        return navigator.mediaDevices.getUserMedia({
            audio: true
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
        this.volumeCtx.fillStyle = "rgb(250, 65, 63)";
        this.volumeCtx.beginPath();
        const volumePer = Math.floor(volume / 255 * 200);
        this.volumeCtx.fillRect(0, 0, volumePer, 10);
    }
}

class YoutubeAPI {
    private stateChange!: (state: 1 | 2) => void;
    private player!: YT.Player;
    // private ready!: () => void;

    public setStateChangeListener(func: (state: 1 | 2) => void) {
        this.stateChange = func;
    }

    // public setReadyListener(func: () => void) {
    //     this.ready = func;
    // }

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
                            resolve();
                        },
                        "onStateChange": (e) => {
                            this.stateChange(e.data as (1 | 2));
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
                <iframe id="player" width="${560}" height="${315}" class="youtube-iframe"
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
    private startTime!: Date;
    private MicRecords!: IPitchBlock[];
    private originRecords!: IPitchBlock[];
    private midiOffset!: number;
    private delay!: number;
    constructor() {
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
        }
        this.MicRecords.push({
            time: now,
            midi: midi
        });
    }

    public getNowMidi() {
        const now = (new Date().getTime() - this.startTime.getTime()) / 1000;
        const nowOrigin = this.originRecords.filter(block => {
            return block.time <= now  && now <= block.time + block.duration!; 
        });
        if (nowOrigin[0]) {
            return nowOrigin[0].midi;
        }
    }

    public render() {
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
        this.ctx.strokeStyle = "rgba(255,255,255,0.3)";
        this.ctx.lineWidth = 1.5;
        this.ctx.shadowColor = "rgba(255,255,255,0.8)";
        this.ctx.shadowBlur = 2;
        for (let i = 0; i <= CONST.MIDI_RANGE; i++) {
            let h = Math.floor(i * CONST.MELODY_HEIGHT / CONST.MIDI_RANGE) + 0.5;
            if (h > CONST.MELODY_HEIGHT) {
                h -= 0.5;
            }
            this.ctx.beginPath();
            this.ctx.moveTo(0, h);
            this.ctx.lineTo(CONST.MELODY_WIDTH, h);
            this.ctx.stroke();
        }
        this.ctx.shadowBlur = 0;
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
        this.ctx.fillStyle = "rgb(0, 253, 103)";
        this.ctx.beginPath();
        this.ctx.fillRect(x, y, width, height);

    }

    private renderMic(midiLevel: number, start: number) {
        this.ctx.fillStyle = "rgba(255, 69, 205, 0.81)";
        const unitHeight = CONST.MELODY_HEIGHT / CONST.MIDI_RANGE;
        const unitWidth = CONST.MELODY_WIDTH / CONST.BASE_SEC / 30;
        const x = start / CONST.BASE_SEC * CONST.MELODY_WIDTH - unitWidth * 6;
        const y = CONST.MELODY_HEIGHT - (midiLevel - this.midiOffset) / CONST.MIDI_RANGE * CONST.MELODY_HEIGHT
            + unitHeight / 4;
        this.ctx.beginPath();
        this.ctx.fillRect(x, y, unitWidth, 2.5);
    }

    private renderNowTimeline(time: number) {
        this.ctx.strokeStyle = "rgba(255,255,255,0.2)";
        this.ctx.lineWidth = 3;
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
