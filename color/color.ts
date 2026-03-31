import {RGB} from "./rgb";
import {HSL} from "./hsl";
import {HSV} from "./hsv";
import {CIELAB} from "./cielab";
import {Oklab} from "./oklab";
import {Oklch} from "./oklch";
import {LMS} from "./lms";
import {CIEXYZ} from "./ciexyz";
import {Vector3} from "../vector/vector";

export type ColorSpaceMap = {
    cielab: CIELAB,
    ciexyz: CIEXYZ,
    hsl: HSL,
    hsv: HSV,
    lms: LMS,
    oklab: Oklab,
    oklch: Oklch,
    rgb: RGB,
};

export type ColorSpace = keyof ColorSpaceMap;


export abstract class Color<S extends ColorSpace = ColorSpace> extends Array<number> {

    declare 0: number;
    declare 1: number;
    declare 2: number;
    declare 3: number;
    declare length: 4;

    public readonly space: S;

    get alpha() {
        return this[3];
    }

    protected constructor(values: number[], space: S) {
        const [v1 = 0, v2 = 0, v3 = 0, alpha = 0] = Array.isArray(values) ? values : [];
        super(v1, v2, v3, alpha);
        this.space = space;
    }

    protected static scalar_to_byte(scalar: number): number {
        return Math.max(0, Math.min(Math.floor(scalar * 256), 255));
    }

    protected static scalar_to_hex(scalar: number): string {
        return Color.byte_to_hex(Color.scalar_to_byte(scalar));
    }

    protected static byte_to_scalar(byte: number): number {
        return Math.max(0, Math.min(byte / 255, 1));
    }

    protected static byte_to_hex(byte: number): string {
        return byte.toString(16).padStart(2, '0');
    }

    protected static hex_to_scalar(hex: string): number {
        return Color.byte_to_scalar(Color.hex_to_byte(hex));
    }

    protected static hex_to_byte(hex: string): number {
        return Number.parseInt(hex, 16) || 0;
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

    bytes(): Vector3 {
        return this.map(Color.scalar_to_byte);
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

    override map<T>(callback: (value: number, index: number, array: number[]) => T, this_arg?: any): Vector3<T> {
        return super.map(callback, this_arg) as Vector3<T>;
    }

    override toString(): string {
        return `${this.space}(${this.map(n => n.toFixed(2)).join(' ')})`
    }
}
