import {Color} from "./color";
import {RGB} from "./rgb";

export class Greyscale extends Color<'greyscale'> {

    static override from(greyscale: ArrayLike<number>): Greyscale {
        return new Greyscale(greyscale, 'greyscale');
    }

    static from_bits(greyscale: ArrayLike<number>, bit_depth: number): Color {
        return Greyscale.from(Array.from(greyscale, c => Color.bits_to_scalar(c, bit_depth)));
    }

    get v() { return this[0]; }

    get value() { return this[0]; }

    override rgb(): RGB {
        return RGB.from(this);
    }
}
