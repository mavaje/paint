import {Color} from "./color";
import {RGB} from "./rgb";
import {HSV} from "./hsv";

export class HSL extends Color<'hsl'> {

    static override from(hsl: number[]): HSL {
        return new HSL(hsl, 'hsl');
    }

    get h() { return this[0]; }
    get s() { return this[1]; }
    get l() { return this[2]; }

    get hue() { return this[0]; }
    get saturation() { return this[1]; }
    get lightness() { return this[2]; }

    override css(): string {
        const [h, s, l, a] = this;
        return `hsl(${h * 360}deg ${s * 100}% ${l * 100}% / ${a * 100}%)`;
    }

    override hsl(): HSL {
        return this;
    }

    override hsv(): HSV {
        const [h, s, l] = this;
        const v = l + s * Math.min(l, 1 - l);
        return HSV.from([
            h,
            v > 0 ? 2 * (1 - l / v) : 0,
            v,
            this.alpha,
        ]);
    }

    override rgb(): RGB {
        const [h, s, l] = this;
        const c = s * (1 - Math.abs(2 * l - 1));
        const x = c * (1 - Math.abs((6 * h) % 2 - 1));
        const min = l - c / 2;
        const mid = min + x;
        const max = min + c;
        const alpha = this.alpha;
        return RGB.from_hue(h, min, mid, max, alpha);
    }
}
