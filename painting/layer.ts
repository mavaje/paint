import {Painting, PixelFilter} from "./painting";
import {RGB} from "../color/rgb";

export class Layer {

    name: string;

    readonly canvas: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;

    final?: ImageData;

    blend_mode: GlobalCompositeOperation = 'source-over';
    opacity: number = 1;

    constructor(
        protected readonly painting: Painting,
        public readonly width: number,
        public readonly height: number,
    ) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext('2d', {
            alpha: painting.has_transparency,
            colorType: 'float16',
            willReadFrequently: true,
        }) as CanvasRenderingContext2D;
        this.final = this.image_data();
        this.name = `Layer ${painting.layers.length}`;
    }

    filter(filter: PixelFilter, apply = false) {
        const image_data = this.image_data();
        let colour;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const offset = (y * this.width + x) * 4;
                const rgba = image_data.data.subarray(offset, offset + 4);
                colour = image_data.pixelFormat === 'rgba-float16'
                    ? RGB.from(rgba)
                    : RGB.from_bytes(rgba);
                colour = filter(colour, x, y);
                image_data.data.set(
                    image_data.pixelFormat === 'rgba-float16'
                    ? colour
                    : colour.bytes(),
                    offset,
                );
            }
        }
        this.context.putImageData(image_data, 0, 0);
        if (apply) this.final = image_data;
    }

    image_data(): ImageData {
        return this.final ?? this.context.getImageData(0, 0, this.width, this.height, this.painting.image_data_settings());
    }
}
