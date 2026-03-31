import {Color} from "./color";
import {Oklab} from "./oklab";

export class Oklch extends Color<'oklch'> {

    get l() { return this[0]; }
    get c() { return this[1]; }
    get h() { return this[2]; }

    static override from(lch: number[]): Oklch {
        return new Oklch(lch, 'oklch');
    }

    protected override super_space(): Color {
        return this.oklab();
    }

    override css(): string {
        const [l, c, h, a] = this;
        return `oklch(${l * 100}% ${c} ${h * 360}deg / ${a})`;
    }

    override oklab(): Oklab {
        const [l, c, h] = this;
        return Oklab.from([
            l,
            c * Math.cos(h * 2 * Math.PI),
            c * Math.sin(h * 2 * Math.PI),
            this.alpha,
        ]);
    }

    override oklch(): Oklch {
        return this;
    }
}
