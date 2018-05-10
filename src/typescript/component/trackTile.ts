import { BaseComponent, IComponentOption, IComponentGenerics } from "./baseComponent";
import { ElementUtil } from "../util";
export interface ITrackTileOption extends IComponentOption {
    readonly title: string;
    readonly coverImage: string;
    readonly onClick: (_this: TrackTileComponent) => void;
}

interface ITrackTileGenerics extends IComponentGenerics {
    option: ITrackTileOption;
    element: HTMLInputElement;
}

export class TrackTileComponent extends BaseComponent<ITrackTileGenerics> {
    /** @override */
    public html() {
        return `
		<div
			class="track-tile-component ${this.getClassNames()}"
			${this.htmlAttr()}
		>
            <div class="track-cover-container">
                <img class="track-cover" src="${this.option!.coverImage}">
                <button class="play-button">
                    ${ElementUtil.getSvgIcon("icon-play", "32")}
                </button>
            </div>
            <div class="track-title">${this.option!.title}</div>
		</div>
		`;
    }

    /** @override */
    public initElem(elem: HTMLElement, option: ITrackTileOption) {
        elem.querySelector(".play-button")!.addEventListener("click", () => option.onClick(this));
    }

    public toggleActive(toggel: boolean) {
        this.element!.classList.toggle("active", toggel);
    }
}
