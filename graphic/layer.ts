
export type BlendMode = 'normal';

export class Layer {

    readonly canvas: HTMLCanvasElement;
    readonly context: CanvasRenderingContext2D;

    blend_mode: BlendMode = 'normal';
    opacity: number = 1;

    constructor(
        public readonly width: number,
        public readonly height: number,
    ) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }
}
