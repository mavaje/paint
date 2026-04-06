
let _supports_float16_color: undefined | boolean = undefined;
export function supports_float16_color(): boolean {
    if (_supports_float16_color !== undefined) return _supports_float16_color;

    try {
        new ImageData(1, 1, {pixelFormat: 'rgba-float16'});
        return _supports_float16_color = true;
    } catch (e) {
        return _supports_float16_color = false;
    }
}
