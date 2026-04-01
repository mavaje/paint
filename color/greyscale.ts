import {Color} from "./color";
import {RGB} from "./rgb";

export class Greyscale extends Color<'greyscale'> {

    static override from(grey: number[]): Greyscale {
        const [value = 0, alpha = 0] = grey;
        return new Greyscale([value, 0, 0, alpha], "greyscale");
    }

    get v() { return this[0]; }

    get value() { return this[0]; }

    override rgb(): RGB {
        const [v,,, alpha] = this;
        return RGB.from([v, v, v, alpha]);
    }
}
