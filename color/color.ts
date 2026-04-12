import {RGB} from "./rgb";
import {HSL} from "./hsl";
import {HSV} from "./hsv";
import {CIELAB} from "./cielab";
import {Oklab} from "./oklab";
import {Oklch} from "./oklch";
import {LMS} from "./lms";
import {CIEXYZ} from "./ciexyz";
import {Vector} from "../vector/vector";
import {clamp} from "../math";
import {Greyscale} from "./greyscale";

export type ColorSpaceMap = {
    cielab: CIELAB,
    ciexyz: CIEXYZ,
    greyscale: Greyscale,
    hsl: HSL,
    hsv: HSV,
    lms: LMS,
    oklab: Oklab,
    oklch: Oklch,
    rgb: RGB,
};

export type ColorSpace = keyof ColorSpaceMap;

export abstract class Color<S extends ColorSpace = ColorSpace> extends Vector<4> {

    public readonly space: S;

    get alpha() {
        return this[3];
    }

    protected constructor(values: ArrayLike<number>, space: S) {
        if (typeof values === 'object' && 0 in values) {
            super(
                values[0] ?? 0,
                values[1] ?? 0,
                values[2] ?? 0,
                values[3] ?? 1,
            );
        } else {
            super(0, 0, 0, 1);
        }
        this.space = space;
    }

    static scalar_to_bits(scalar: number, bit_depth: number): number {
        return Math.round(clamp(scalar, 0, 1) * ((1 << bit_depth) - 1));
    }

    static scalar_to_byte(scalar: number): number {
        return Color.scalar_to_bits(scalar, 8);
    }

    static scalar_to_hex(scalar: number): string {
        return Color.byte_to_hex(Color.scalar_to_byte(scalar));
    }

    static bits_to_scalar(bits: number, bit_depth: number): number {
        return clamp(bits / ((1 << bit_depth) - 1), 0, 1);
    }

    static byte_to_scalar(byte: number): number {
        return Color.bits_to_scalar(byte, 8);
    }

    static byte_to_hex(byte: number): string {
        return byte.toString(16).padStart(2, '0');
    }

    static hex_to_scalar(hex: string): number {
        return Color.byte_to_scalar(Color.hex_to_byte(hex));
    }

    static hex_to_byte(hex: string): number {
        return Number.parseInt(hex, 16) || 0;
    }

    static distance(color1: Color, color2: Color, space: ColorSpace = 'rgb'): number {
        const [x1, y1, z1, a1] = color1.in_space(space);
        const [x2, y2, z2, a2] = color2.in_space(space);
        return Math.hypot(x1 - x2, y1 - y2, z1 - z2, a1 - a2);
    }

    static nearest_index(colors: Color[], color: Color, space?: ColorSpace): number {
        let nearest: number = 0;
        let distance: number = Infinity;
        for (let i = 0; i < colors.length; i++) {
            const d = Color.distance(colors[i], color, space);
            if (d === 0) return i;
            if (d < distance) {
                nearest = i;
                distance = d;
            }
        }
        return nearest;
    }

    static nearest_color(colors: Color[], color: Color, space?: ColorSpace): Color {
        return colors[Color.nearest_index(colors, color, space)];
    }

    protected static to_linear(value: number): number {
        return value <= 0.04045
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
    }

    protected static from_linear(value: number): number {
        return value <= 0.0031308
            ? 12.92 * value
            : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
    }

    is_opaque() {
        return this.alpha === 1;
    }

    is_translucent() {
        return this.alpha < 1;
    }

    is_transparent() {
        return this.alpha === 0;
    }

    bytes(): Vector<4> {
        return this.map(Color.scalar_to_byte) as Vector<4>;
    }

    bits(bit_depth: number): Vector<4> {
        return this.map(v => Color.scalar_to_bits(v, bit_depth)) as Vector<4>;
    }

    hex(): string {
        return '#' + this.rgb()
            .map(Color.scalar_to_hex)
            .join('');
    }

    css(): string {
        return this.super_space().css();
    }

    in_space<S extends ColorSpace>(space: S): ColorSpaceMap[S] {
        return this[space]() as ColorSpaceMap[S];
    }

    protected super_space(): Color {
        return this.rgb();
    }

    cielab(): CIELAB {
        return this.super_space().cielab();
    }

    ciexyz(): CIEXYZ {
        return this.super_space().ciexyz();
    }

    greyscale(): Greyscale {
        return this.super_space().greyscale();
    }

    hsl(): HSL {
        return this.super_space().hsl();
    }

    hsv(): HSV {
        return this.super_space().hsv();
    }

    lms(): LMS {
        return this.super_space().lms();
    }

    oklab(): Oklab {
        return this.super_space().oklab();
    }

    oklch(): Oklch {
        return this.super_space().oklch();
    }

    rgb(): RGB {
        return this.super_space().rgb();
    }

    opaque(): this {
        return this.map((v, i) => i < 3 ? v : 1) as this;
    }

    map_color(callback: (value: number, index: number) => number): this {
        return this.map((v, i) => i < 3 ? callback(v, i) : v) as this;
    }

    override toString(): string {
        return `${this.space}(${this.map(n => n.toFixed(2)).join(' ')})`
    }
}
