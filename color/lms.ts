import {Color} from "./color";
import {RGB} from "./rgb";
import {Oklab} from "./oklab";
import {Oklch} from "./oklch";
import {mat3x3} from "../vector/matrix";

export class LMS extends Color<'lms'> {

    get l() { return this[0]; }
    get m() { return this[1]; }
    get s() { return this[2]; }

    static override from(lms: number[]): LMS {
        return new LMS(lms, 'lms');
    }

    override lms(): LMS {
        return this;
    }

    override oklab(): Oklab {
        return Oklab.from([
            ...mat3x3([
                [0.2104542553,  0.7936177850, -0.0040720468],
                [1.9779984951, -2.4285922050,  0.4505937099],
                [0.0259040371,  0.7827717662, -0.8086757660]
            ]).multiply(this.map_color(Math.cbrt)),
            this.alpha,
        ]);
    }

    override oklch(): Oklch {
        return this.oklab().oklch();
    }

    override rgb(): RGB {
        return RGB.from([
            ...mat3x3([
                [ 4.0767416621, -3.3077115913,  0.2309699292],
                [-1.2684380046,  2.6097574011, -0.3413193965],
                [-0.0041960863, -0.7034186147,  1.7076147010],
            ]).multiply(this).map(Color.from_linear),
            this.alpha,
        ]);
    }
}
