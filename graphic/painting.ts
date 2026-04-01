import {Layer} from "./layer";
import {Palette} from "./palette";

export class Painting {

    layers: Layer[] = [];
    palette: undefined|Palette;
    has_transparency: boolean = true;
    is_greyscale: boolean = false;
    color_depth: number = 8;

    constructor(
        public width: number,
        public height: number,
    ) {
        this.add_layer();
    }

    add_layer(index: number = this.layers.length) {
        const layer = new Layer(this.width, this.height);
        this.layers.splice(index, 0, layer);
    }
}
