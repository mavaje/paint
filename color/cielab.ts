import {Color} from "./color";
import {CIEXYZ} from "./ciexyz";
import {mat4x3} from "../vector/matrix";

export class CIELAB extends Color<'cielab'> {

    get l() { return this[0]; }
    get a() { return this[1]; }
    get b() { return this[2]; }

    static override from(lab: number[]): CIELAB {
        return new CIELAB(lab, 'cielab');
    }

    protected override super_space(): Color {
        return this.ciexyz();
    }

    override css(): string {
        const [l, a, b, alpha] = this;
        return `lab(${l * 100}% ${a} ${b} / ${alpha})`;
    }

    override cielab(): CIELAB {
        return this;
    }

    override ciexyz(): CIEXYZ {
        return CIEXYZ.from([
            ...mat4x3([
                [1/116, 1/500, 0,     16/116],
                [1/116, 0,     0,     16/116],
                [1/116, 0,    -1/200, 16/116],
            ]).multiply(this.opaque())
                .map(v => v > 6/29
                    ? v ** 3
                    : 3 * (6/29) ** 2 * (v - 4/29))
                .map((v, i) => v * [95.0489, 100, 108.884][i]),
            this.alpha,
        ]);
    }
}
