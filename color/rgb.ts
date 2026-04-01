import {Color} from "./color";
import {HSL} from "./hsl";
import {HSV} from "./hsv";
import {Oklab} from "./oklab";
import {Oklch} from "./oklch";
import {LMS} from "./lms";
import {CIEXYZ} from "./ciexyz";
import {CIELAB} from "./cielab";
import {mat3x3} from "../vector/matrix";
import {Greyscale} from "./greyscale";

export class RGB extends Color {

    get r() { return this[0]; }
    get g() { return this[1]; }
    get b() { return this[2]; }

    get red() { return this[0]; }
    get green() { return this[1]; }
    get blue() { return this[2]; }

    static override from(rgb: number[]): RGB {
        return new RGB(rgb, 'rgb');
    }

    static from_bytes(rgb: ArrayLike<number>): RGB {
        return RGB.from(Array.from(rgb, Color.byte_to_scalar));
    }

    static from_hex(hex: string): RGB {
        hex = hex.replace(/[^\da-f]/gi, '');
        switch (hex.length) {
            case 0:
            case 1:
            case 2:
                const x = Color.hex_to_scalar(hex);
                return RGB.from([x, x, x]);
            case 3:
            case 4:
            case 5:
                return RGB.from([...hex]
                    .map(x => x.repeat(2))
                    .map(Color.hex_to_scalar));
            case 6:
            case 7:
                return RGB.from([0, 2, 4]
                    .map(i => hex.slice(i, i + 2))
                    .map(Color.hex_to_scalar));
            default:
                return RGB.from([0, 2, 4, 6]
                    .map(i => hex.slice(i, i + 2))
                    .map(Color.hex_to_scalar));
        }
    }

    static from_hue(hue: number, min: number, mid: number, max: number, alpha: number = 1) {
        return RGB.from([
            [max, mid, min, alpha],
            [mid, max, min, alpha],
            [min, max, mid, alpha],
            [min, mid, max, alpha],
            [mid, min, max, alpha],
            [max, min, mid, alpha],
        ][Math.floor(hue * 6)]);
    }

    protected hue(): number {
        const [r, g, b] = this.rgb();
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        if (min === max) return 0;
        const range = 6 * (max - min);
        return {
            [r]: (g - b) / range + 1,
            [g]: (b - r) / range + 1 / 3,
            [b]: (r - g) / range + 2 / 3,
        }[max] % 1;
    }

    override css(): string {
        const [r, g, b, a] = this.map_color(Color.scalar_to_byte);
        return `rgb(${r} ${g} ${b} / ${a * 100}%)`;
    }

    override cielab(): CIELAB {
        return this.ciexyz().cielab();
    }

    override ciexyz(): CIEXYZ {
        return CIEXYZ.from([
            ...mat3x3([
                [0.49,    0.31,   0.2],
                [0.17697, 0.8124, 0.01063],
                [0,       0.01,   0.99],
            ]).multiply(this.map_color(Color.to_linear)),
            this.alpha,
        ]);
    }

    override greyscale(): Greyscale {
        const [r, g, b, a] = this;
        return Greyscale.from([
            0.299 * r + 0.587 * g + 0.114 * b,
            a,
        ]);
    }

    override hsl(): HSL {
        const [r, g, b] = this;
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        const range = max - min;
        const l = (min + max) / 2;
        const scale = 1 - Math.abs(2 * l - 1);
        return HSL.from([
            this.hue(),
            scale > 0 ? range / scale : 0,
            l,
            this.alpha,
        ]);
    }

    override hsv(): HSV {
        const [r, g, b] = this;
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        const range = max - min;
        return HSV.from([
            this.hue(),
            max > 0 ? range / max : 0,
            max,
            this.alpha,
        ]);
    }

    override lms(): LMS {
        return LMS.from([
            ...mat3x3([
                [0.4122214708, 0.5363325363, 0.0514459929],
                [0.2119034982, 0.6806995451, 0.1073969566],
                [0.0883024619, 0.2817188376, 0.6299787005],
            ]).multiply(this.map_color(Color.to_linear)),
            this.alpha,
        ]);
    }

    override oklab(): Oklab {
        return this.lms().oklab();
    }

    override oklch(): Oklch {
        return this.oklab().oklch();
    }

    override rgb(): RGB {
        return this;
    }
}
