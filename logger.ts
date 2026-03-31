
const LOGGING = true;

export function log<T>(value: T, format?: (v: T) => any): T {
    if (LOGGING) {
        console.log(format?.(value) ?? value);
    }
    return value;
}
