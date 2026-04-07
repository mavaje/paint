import {BitDepth, ColorType, Header} from "./chunk/header";
import {Time} from "./chunk/time";
import {Trailer} from "./chunk/trailer";
import {PNG} from "./png";
import {ByteArray} from "../byte-array";
import {ChunkType} from "./chunk/chunk";
import {ChunkFactory} from "./chunk-factory";
import {Painting} from "../painting/painting";
import {clamp} from "../math";
import {Palette} from "./chunk/palette";
import {Data} from "./chunk/data";
import {Transparency} from "./chunk/transparency";
import {stopwatch} from "../stopwatch";

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
            const length = byte_array.read_uint32(index);
            const type = byte_array.read_chars(4) as ChunkType;
            const chunk_data = byte_array.slice(index + 8, index + length + 8);
            const check_crc = byte_array.crc(index + 4, index + length + 8);
            const data_crc = byte_array.read_uint32(index + length + 8);

            if (data_crc !== check_crc) {
                console.log(`CRC mismatch: ${data_crc} != ${check_crc}`);
                console.log(new ByteArray(4).write_uint32(data_crc).toString());
                console.log(new ByteArray(4).write_uint32(check_crc).toString());
                // throw new Error(`Incorrect CRC for chunk ${type}`);
            }

            chunk_factory.from_data(type, chunk_data);

            index += length + 12;
        }

        return png;
    }

    from_painting(painting: Painting): PNG {
        stopwatch.start('Loading PNG from painting');

        const png = new PNG();

        let bit_depth: BitDepth;
        if (painting.palette) {
            const color_count = clamp(painting.palette.colors.length, 2, 256);
            bit_depth = 1 << Math.ceil(Math.log2(Math.log2(color_count)));
            bit_depth = clamp(bit_depth, 1, 8) as BitDepth;
        } else {
            bit_depth = 1 << Math.ceil(Math.log2(painting.color_depth));
            bit_depth = clamp(bit_depth, painting.is_greyscale ? 1 : 8, 16) as BitDepth;
        }

        let color_type: ColorType;
        if (painting.palette) {
            color_type = ColorType.INDEXED_COLOR;
        } else if (painting.is_greyscale) {
            color_type = painting.has_transparency
                ? ColorType.GREYSCALE_ALPHA
                : ColorType.GREYSCALE;
        } else {
            color_type = painting.has_transparency
                ? ColorType.TRUECOLOR_ALPHA
                : ColorType.TRUECOLOR;
        }

        png.push_chunk(new Header(
            painting.width,
            painting.height,
            bit_depth,
            color_type,
        ));

        png.push_chunk(new Time());

        if (painting.palette) {
            png.push_chunk(new Palette(painting.palette.colors));

            if (painting.has_transparency) {
                png.push_chunk(new Transparency(undefined));
            }
        }

        png.push_chunk(new Data(painting.image_data()));

        if (painting.layers.length > 1) {
            const image_data = painting.layers[0].image_data();
            png.push_chunk(new Data(image_data));
        }

        png.push_chunk(new Trailer());

        stopwatch.lap('Created PNG');

        return png;
    }
}
