export interface IPitchBlock {
    time: number;
    midi: number;
    duration?: number;
}

export interface ITrack {
    delay: number;
    youtubeId: string;
    midiOffset: number;
    tracks: Array<{
        notes: IPitchBlock[];
    }>;
}
