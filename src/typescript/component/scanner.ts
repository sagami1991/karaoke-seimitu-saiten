import { BaseComponent, IComponentOption } from "./baseComponent";
import { ElementUtil } from "../util";

export class ComponentScanner {
    private static components: Map<number, {
        component: BaseComponent,
        option: IComponentOption
    }> = new Map();

    private static id: number = 0;

    public static register(component: BaseComponent, option: IComponentOption) {
        this.id++;
        this.components.set(this.id, { component: component, option: option });
        return this.id;
    }
    public static scanHtml(html: string): HTMLElement {
        const outerElem = ElementUtil.builder(html);
        this.scan(outerElem);
        return outerElem;
    }

    public static scanHtmls(html: string): HTMLElement[] {
        const container = document.createElement("div");
        container.innerHTML = html;
        this.scan(container);
        const elements: HTMLElement[] = [];
        while (container.firstChild) {
            const element = container.firstChild;
            container.removeChild(element);
            elements.push(element as HTMLElement);
        }
        return elements;
    }

    public static scan(outerElem: HTMLElement) {
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
            componentSet.component.preInitElem(element as HTMLElement);
            componentSet.component.initElem(element as HTMLElement, componentSet.option);
        }
    }
}
