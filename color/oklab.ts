import {Color} from "./color";
import {RGB} from "./rgb";
import {Oklch} from "./oklch";
import {LMS} from "./lms";
import {mat3x3} from "../vector/matrix";

export class Oklab extends Color<'oklab'> {

    get l() { return this[0]; }
    get a() { return this[1]; }
    get b() { return this[2]; }

    static override from(lab: number[]): Oklab {
        return new Oklab(lab, 'oklab');
    }

    override css(): string {
        const [l, a, b, alpha] = this;
        return `oklab(${l * 100}% ${a} ${b} / ${alpha})`;
    }

    override lms(): LMS {
        return LMS.from([
            ...mat3x3([
                [1,  0.3963377774,  0.2158037573],
                [1, -0.1055613458, -0.0638541728],
                [1, -0.0894841775, -1.2914855480],
            ]).multiply(this).map(x => x ** 3),
            this.alpha,
        ]);
    }

    override oklab(): Oklab {
        return this;
    }

    override oklch(): Oklch {
        const [l, a, b] = this;
        return Oklch.from([
            l,
            Math.hypot(a, b),
            Math.atan2(b, a) / (2 * Math.PI),
            this.alpha,
        ]);
    }

    override rgb(): RGB {
        return this.lms().rgb();
    }
}
