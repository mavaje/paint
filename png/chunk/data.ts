import {Chunk, ChunkType} from "./chunk";
import {ByteArray} from "../../byte-array";
import {PNG} from "../png";
import {Color} from "../../color/color";
import {ColorType} from "./header";

export class Data extends Chunk<ChunkType.IMAGE_DATA> {

    constructor(
        public image_data: ImageData,
    ) {
        super(ChunkType.IMAGE_DATA);
    }

    static from_data_bytes(data: ByteArray, png: PNG): Data {
        if (data && png) {

        }

        return new Data(
            new ImageData(1, 1),
        );
    }

    override data_bytes(png: PNG): ByteArray {
        const header = png.header();

        const {width, height, data, pixelFormat} = this.image_data;

        const bpp = {
            [ColorType.GREYSCALE]: header.bit_depth,
            [ColorType.GREYSCALE_ALPHA]: header.bit_depth * 2,
            [ColorType.TRUECOLOR]: header.bit_depth * 3,
            [ColorType.TRUECOLOR_ALPHA]: header.bit_depth * 4,
            [ColorType.INDEXED_COLOR]: header.bit_depth,
        }[header.color_type];
        const scanline_length = 1 + Math.ceil(width * bpp / 8);
        const raw = new ByteArray(height * scanline_length);

        let offset = 0;
        for (let y = 0; y < height; y++) {
            raw.set(0, offset++, 1);

            switch (header.bit_depth) {
                case 1:
                    break;
                case 2:
                    break;
                case 4:
                    break;
                case 8:
                    for (let x = 0; x < width; x++) {
                        const pixel = data.subarray((y * height + x) * 4, (y * height + x + 1) * 4);
                        for (let v of pixel) {
                            switch (pixelFormat) {
                                case 'rgba-unorm8':
                                    raw.set(v, offset++, 1);
                                    break;
                                case 'rgba-float16':
                                    const bits = Color.scalar_to_byte(v);
                                    raw.set(bits, offset++, 1);
                                    break;
                            }
                        }
                    }
                    break;
                case 16:
                    for (let x = 0; x < width; x++) {
                        const pixel = data.subarray((y * height + x) * 4, (y * height + x + 1) * 4);
                        for (let v of pixel) {
                            switch (pixelFormat) {
                                case 'rgba-unorm8':
                                    raw.set([v, v], offset);
                                    break;
                                case 'rgba-float16':
                                    const bits = Color.scalar_to_bits(v, 16);
                                    raw.set(bits, offset, 2);
                                    break;
                            }
                            offset += 2;
                        }
                    }
                    break;
            }
        }

        // return new ByteArray(zlib.deflateSync(raw));
        return new ByteArray(raw);
    }
}
