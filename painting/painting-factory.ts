import {event} from "../promises";
import {Painting} from "./painting";
import {PNGFactory} from "../png/png-factory";
import {ChunkType} from "../png/chunk/chunk";
import {Data} from "../png/chunk/data";
import {LayerData} from "../png/chunk/layer-data";
import {PNG} from "../png/png";

export class PaintingFactory {

    async from_file(file: File): Promise<Painting> {
        if (file.type === 'image/png') {
            const data = await file.bytes();
            const png = new PNGFactory().from_data(data);
            return this.from_png(png);
        } else if (file.type.startsWith('image/')) {
            try {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                await event(reader, 'load', ['abort', 'error']);

                const image = new Image();
                image.src = reader.result as string;
                await event(image, 'load', ['abort', 'error']);

                const painting = new Painting(image.width, image.height);
                painting.add_layer().context.drawImage(image, 0, 0);
                return painting;
            } catch (error) {
                throw new Error('File seems corrupted!');
            }
        } else {
            throw new Error('Invalid file type!');
        }
    }

    from_png(png: PNG): Painting {
        const {width, height} = png.header();

        const painting = new Painting(width, height);

        if (png.has_chunk(ChunkType.LAYER_CONTROL)) {
            (png.chunk_map[ChunkType.LAYER_DATA] as undefined | LayerData[])?.forEach(layer_data => {
                const layer = painting.add_layer(layer_data.layer_index);
                layer.opacity = layer_data.opacity;
                layer.blend_mode = layer_data.blend_mode;
                if (layer_data.image_data) layer.context.putImageData(layer_data.image_data, 0, 0);
            });
        } else {
            const layer = painting.add_layer();
            (png.chunk_map[ChunkType.IMAGE_DATA] as undefined | Data[])?.forEach(({image_data, dx, dy}) => {
                if (image_data) layer.context.putImageData(image_data, dx, dy);
            });
        }

        return painting;
    }
}
