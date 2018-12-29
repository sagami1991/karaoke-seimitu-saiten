export class Observable<T> {
    private static observerId: number = 0;
    public static createObserverId() {
        return `observer_${this.observerId ++}`;
    }

    private listenMap: Map<string, {[key in keyof T]?: (args: T[key]) => void}> = new Map();

    public addListener<K extends keyof T>(name: K, observerId: string, cb: (args: T[K]) => void) {
        if (this.listenMap.get(observerId) === undefined) {
            this.listenMap.set(observerId, {});
        }
        this.listenMap.get(observerId)![name] = <any>cb;
    }

    public disposeObserve(observerId: string) {
        this.listenMap.delete(observerId);
    }

    protected trigger<K extends keyof T>(name: K, args: T[K]) {
        this.listenMap.forEach(map => {
            const callback = map[name];
            if (callback) {
                callback(args);
            }
        });
    }

    protected getObservers() {
        return Array.from(this.listenMap.values());
    }
}
