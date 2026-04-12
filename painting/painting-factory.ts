import {event} from "../promises";
import {Painting} from "./painting";
import {PNGFactory} from "../png/png-factory";
import {PNG} from "../png/png";
import {ColorType} from "../png/chunk/header";
import {Palette} from "./palette";
import {stopwatch} from "../stopwatch";

export class PaintingFactory {

    async from_file(file: File): Promise<Painting> {
        stopwatch.start('loading painting from file');
        if (file.type === 'image/png') {
            const data = await file.bytes();
            stopwatch.lap('PNG Data read');
            const png = new PNGFactory().from_data(data);
            stopwatch.lap('PNG File parsed');
            return this.from_png(png);
        } else if (file.type.startsWith('image/')) {
            try {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                await event(reader, 'load', ['abort', 'error']);

                stopwatch.lap('File reader loaded up');

                const image = new Image();
                image.src = reader.result as string;
                await event(image, 'load', ['abort', 'error']);

                stopwatch.lap('Image element loaded');

                const painting = new Painting(image.width, image.height);
                painting.add_layer().context.drawImage(image, 0, 0);

                stopwatch.lap('Painting created');

                return painting;
            } catch (error) {
                console.log(error);
                throw new Error('File seems corrupted!');
            }
        } else {
            throw new Error('Invalid file type!');
        }
    }

    from_png(png: PNG): Painting {
        const {width, height, bit_depth, color_type} = png.header();

        const painting = new Painting(width, height, png);

        painting.color_depth = bit_depth;

        switch (color_type) {
            case ColorType.GREYSCALE:
                painting.is_greyscale = true;
                painting.has_transparency = false;
                break;

            case ColorType.GREYSCALE_ALPHA:
                painting.is_greyscale = true;
                painting.has_transparency = true;
                break;

            case ColorType.TRUECOLOR:
                painting.is_greyscale = false;
                painting.has_transparency = false;
                break;

            case ColorType.TRUECOLOR_ALPHA:
                painting.is_greyscale = false;
                painting.has_transparency = true;
                break;

            case ColorType.INDEXED_COLOR:
                const palette = new Palette(png.palette(true).colors);
                painting.palette = palette;
                break;
        }

        const layers = png.layer_data();

        if (layers.length > 0) {
            layers.forEach(layer_data => {
                const layer = painting.add_layer(layer_data.layer_index);
                layer.opacity = layer_data.opacity;
                layer.blend_mode = layer_data.blend_mode;
                if (layer_data.image_data) layer.context.putImageData(layer_data.image_data, 0, 0);
            });
        } else {
            const layer = painting.add_layer();
            const data = png.image_data();
            if (data.image_data) layer.context.putImageData(data.image_data, 0, 0);
        }

        stopwatch.lap('Painting created');

        return painting;
    }
}
