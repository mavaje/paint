import {Color} from "./color";
import {RGB} from "./rgb";
import {CIELAB} from "./cielab";
import {mat3x3, mat4x3} from "../vector/matrix";

export class CIEXYZ extends Color<'ciexyz'> {

    get x() { return this[0]; }
    get y() { return this[1]; }
    get z() { return this[2]; }

    static override from(lab: number[]): CIEXYZ {
        return new CIEXYZ(lab, 'ciexyz');
    }

    override cielab(): CIELAB {
        return CIELAB.from([
            ...mat4x3([
                [  0,  116,    0, -16],
                [500, -500,    0,   0],
                [  0,  200, -200,   0],
            ]).multiply(this
                .map_color((v, i) => v / [95.0489, 100, 108.884][i])
                .map_color(v => v > (6/29) ** 3
                    ? Math.cbrt(v)
                    : v / (3 * (6/29) ** 2) + 4/29)
                .opaque()),
            this.alpha,
        ]);
    }

    override ciexyz(): CIEXYZ {
        return this;
    }

    override rgb(): RGB {
        return RGB.from([
            ...mat3x3([
                [ 2.36461385, -0.89654057, -0.46807328],
                [-0.51516621,  1.4264081,   0.0887581],
                [ 0.0052037,  -0.01440816,  1.00920446],
            ]).multiply(this).map(Color.from_linear),
            this.alpha,
        ]);
    }
}
