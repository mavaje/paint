import {Color} from "./color";
import {RGB} from "./rgb";
import {HSL} from "./hsl";

export class HSV extends Color<'hsv'> {

    static override from(hsv: number[]): HSV {
        return new HSV(hsv, 'hsv');
    }

    get h() { return this[0]; }
    get s() { return this[1]; }
    get v() { return this[2]; }

    get hue() { return this[0]; }
    get saturation() { return this[1]; }
    get value() { return this[2]; }

    override css(): string {
        return this.hsl().css();
    }

    override hsl(): HSL {
        const [h, s, v] = this;
        const l = v * (1 - s / 2);
        const scale = Math.min(l, 1 - l);
        return HSL.from([
            h,
            scale > 0 ? (v - l) / scale : 0,
            l,
            this.alpha,
        ]);
    }

    override hsv(): HSV {
        return this;
    }

    override rgb(): RGB {
        const [h, s, v] = this;
        const max = v;
        const min = v * (1 - s);
        const mid = v * (1 - s * Math.abs((6 * h) % 2 - 1));
        const alpha = this.alpha;
        return RGB.from_hue(h, min, mid, max, alpha);
    }
}
