import {Layer} from "./layer";
import {Palette} from "./palette";
import {Color} from "../color/color";

export type PixelFilter = (pixel: Color, x: number, y: number) => Color;

export class Painting {

    layers: Layer[] = [];
    palette: undefined | Palette;
    has_transparency: boolean = true;
    is_greyscale: boolean = false;
    color_depth: number = 8;

    constructor(
        public width: number,
        public height: number,
    ) {
    }

    add_layer(index: number = this.layers.length): Layer {
        const layer = new Layer(this, this.width, this.height);
        this.layers.splice(index, 0, layer);
        return layer;
    }

    set_palette(palette: Palette, apply = false) {
        this.filter(color => palette.nearest(color), apply);
        if (apply) this.palette = palette;
    }

    filter(filter: PixelFilter, apply = false) {
        this.layers.forEach(layer => layer.filter(filter, apply));
    }

    flatten(): OffscreenCanvasRenderingContext2D {
        const canvas = new OffscreenCanvas(this.width, this.height);
        const context = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
        this.layers.forEach(layer => {
            context.globalAlpha = layer.opacity;
            context.globalCompositeOperation = layer.blend_mode;
            context.drawImage(layer.canvas, 0, 0);
        });
        return context;
    }

    image_data(): ImageData {
        if (this.layers.length === 1) {
            return this.layers[0].image_data();
        }

        return this.flatten().getImageData(0, 0, this.width, this.height, this.image_data_settings());
    }

    image_data_settings(): ImageDataSettings {
        return {
            pixelFormat: this.uses_float16_color()
                ? 'rgba-float16'
                : 'rgba-unorm8',
        };
    }

    uses_float16_color(): boolean {
        return !this.palette && this.color_depth > 8
    }
}
