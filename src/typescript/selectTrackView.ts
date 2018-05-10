import { ElementUtil } from "./util";
import { Observable } from "./component/observable";
import { ITrack } from "./interface";
import { silhouette } from "./tracks/silhouette";
import { futakotome } from "./tracks/futakotome";
import { TrackTileComponent } from "./component/trackTile";
import { ComponentScanner } from "./component/scanner";
import { kiminosiranai } from "./tracks/kiminosiranai";

interface ISelectTrackEvents {
    "select": ITrack;
}

export class SelectTrackView extends Observable<ISelectTrackEvents> {

    private _el: HTMLElement;

    get el() {
        return this._el;
    }

    constructor() {
        super();
        const tracks = [silhouette, futakotome, kiminosiranai];
        const trackParts = tracks.map((track) => {
            return new TrackTileComponent({
                title: track.titie,
                coverImage: track.cover,
                onClick: () => {
                    this.trigger("select", track);
                }
            });
        });
        this._el = ElementUtil.builder(`
            <div class="select-track-view">
                ${trackParts.map((trackPart) => trackPart.html()).join("")}
            </div>
        `);
        ComponentScanner.scan(this._el);
    }
}
