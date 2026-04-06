import {Color} from "../color/color";

export class Palette {

    constructor(public colors: Color[] = []) {}

    index_of(color: Color): number {
        return Color.nearest_index(this.colors, color);
    }
}
