import {BitDepth, ColorType, Header} from "./chunk/header";
import {Time} from "./chunk/time";
import {Trailer} from "./chunk/trailer";
import {PNG} from "./png";
import {ByteArray} from "../byte-array";
import {Chunk, ChunkType} from "./chunk/chunk";
import {ChunkFactory} from "./chunk-factory";
import {Painting} from "../graphic/painting";
import {clamp} from "../math";
import {Palette} from "./chunk/palette";
import {Data} from "./chunk/data";

export class PNGFactory {

    from_data(data: ArrayLike<number>): PNG {
        if (!PNG.SIGNATURE.every((byte, i) => byte === data[i])) {
            throw new Error('Incorrect PNG signature!');
        }

        const png = new PNG();
        let index = 8;
        const byte_array = new ByteArray(data);

        const chunk_factory = new ChunkFactory(png);

        while (index < data.length) {
            const length = byte_array.integer(index, 4);
            const type = byte_array.string(index + 4, 4) as ChunkType;
            const chunk_data = byte_array.sub(index + 8, index + length + 8);
            const crc = byte_array.integer(index + length + 8, 4);

            if (crc !== Chunk.crc(byte_array.sub(index + 4, index + length + 8))) {
                throw new Error(`Incorrect CRC for chunk ${type}`);
            }

            const chunk = chunk_factory.from_data(type, chunk_data);

            console.log(`${chunk.type} (${length}):`);
            console.log(chunk.data_bytes(png).toString());

            index += length + 12;
        }

        return png;
    }

    from_graphic(graphic: Painting): PNG {
        const png = new PNG();

        let bit_depth: BitDepth;
        if (graphic.palette) {
            const color_count = clamp(graphic.palette.colors.length, 2, 256);
            bit_depth = 1 << Math.ceil(Math.log2(Math.log2(color_count)));
            bit_depth = clamp(bit_depth, 1, 8) as BitDepth;
        } else {
            bit_depth = 1 << Math.ceil(Math.log2(graphic.color_depth));
            bit_depth = clamp(bit_depth, graphic.is_greyscale ? 1 : 8, 16) as BitDepth;
        }

        let color_type: ColorType;
        if (graphic.palette) {
            color_type = ColorType.INDEXED_COLOR;
        } else if (graphic.is_greyscale) {
            color_type = graphic.has_transparency
                ? ColorType.GREYSCALE_ALPHA
                : ColorType.GREYSCALE;
        } else {
            color_type = graphic.has_transparency
                ? ColorType.TRUECOLOR_ALPHA
                : ColorType.TRUECOLOR;
        }

        png.push_chunk(new Header(
            graphic.width,
            graphic.height,
            bit_depth,
            color_type,
        ));

        png.push_chunk(new Time());

        if (graphic.palette) {
            png.push_chunk(new Palette(graphic.palette.colors));
        }

        graphic.layers.forEach(layer => {
            const image_data = layer.context.getImageData(0, 0, layer.width, layer.height);
            png.push_chunk(new Data(image_data));
        });

        png.push_chunk(new Trailer());

        return png;
    }
}
