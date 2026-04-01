
export async function event<
    K extends keyof FileReaderEventMap,
    E extends keyof FileReaderEventMap,
>(target: FileReader, type: K | K[], error_type?: E | E[]): Promise<FileReaderEventMap[K]>;
export async function event<
    K extends keyof HTMLElementEventMap,
    E extends keyof HTMLElementEventMap,
>(target: HTMLElement, type: K | K[], error_type?: E | E[]): Promise<HTMLElementEventMap[K]>;
export async function event(target: EventTarget, type: string, error_type?: string): Promise<Event>;
export async function event(target: EventTarget, type: string | string[], error_type?: string | string[]): Promise<Event> {
    return new Promise((done, error) => {
        if (Array.isArray(type)) {
            type.forEach(t => target.addEventListener(t, done, {once: true}));
        } else {
            target.addEventListener(type, done, {once: true});
        }

        if (error_type) {
            if (Array.isArray(error_type)) {
                error_type.forEach(t => target.addEventListener(t, error, {once: true}));
            } else {
                target.addEventListener(error_type, error, {once: true});
            }
        }
    });
}
