import {Painting} from "./painting";

export class Layer {

    readonly canvas: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;

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
            willReadFrequently: true,
        }) as CanvasRenderingContext2D;
    }

    image_data(settings?: ImageDataSettings): ImageData {
        return this.context.getImageData(0, 0, this.width, this.height, settings);
    }
}
