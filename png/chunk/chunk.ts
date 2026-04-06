import crc32 from "crc-32";

import {ByteArray} from "../../byte-array";
import {PNG} from "../png";
import {ColorType} from "./header";
import {RGB} from "../../color/rgb";
import {Color} from "../../color/color";
import pako from "pako";
import {Greyscale} from "../../color/greyscale";
import {supports_float16_color} from "../../browser";

export enum ChunkType {
    HEADER = 'IHDR',
    PALETTE = 'PLTE',
    IMAGE_DATA = 'IDAT',
    TRAILER = 'IEND',
    TIME = 'tIME',
    BACKGROUND = 'bKGD',
    LAYER_CONTROL = 'lcTl',
    LAYER_DATA = 'ldAt',
}

export abstract class Chunk<T extends ChunkType = ChunkType> {

    protected constructor(
        public type: T,
    ) {}

    static crc(bytes: ByteArray) {
        return crc32.buf(new Uint8Array(bytes)) & 0xFFFFFFFF;
    }

    static read_image_data(data: ByteArray, png: PNG): undefined|ImageData {
        const {width, bit_depth, color_type, interlace_method} = png.header();

        // @ts-ignore
        const raw = new ByteArray(pako.inflate(data));

        const samples = {
            [ColorType.GREYSCALE]: 1,
            [ColorType.GREYSCALE_ALPHA]: 2,
            [ColorType.TRUECOLOR]: 3,
            [ColorType.TRUECOLOR_ALPHA]: 4,
            [ColorType.INDEXED_COLOR]: 1,
        }[color_type];

        const pixel_bits = bit_depth * samples;
        const pixel_bytes = pixel_bits / 8;
        const scanline_length = 1 + Math.ceil(width * pixel_bytes);
        const height = raw.length / scanline_length;

        if (height === 0) return undefined;

        const image_data = new ImageData(width, height, {
            pixelFormat: bit_depth > 8 && supports_float16_color()
                ? 'rgba-float16'
                : 'rgba-unorm8'
        });

        for (let y = 0; y < height; y++) {
            raw.align_read_head();
            const filter_type = raw.read_byte();
            if (filter_type !== 0) {
                throw new Error(`filter type ${filter_type} not supported (yet)!`)
            }
            for (let x = 0; x < width; x++) {
                if (interlace_method) {

                } else {

                }

                const channels: number[] = [];
                for (let c = 0; c < samples; c++) {
                    channels.push(raw.read_uint(bit_depth));
                }

                let color: Color;
                switch (color_type) {
                    case ColorType.GREYSCALE:
                    case ColorType.GREYSCALE_ALPHA:
                        color = Greyscale.from_bits(channels, bit_depth);
                        break;

                    case ColorType.TRUECOLOR:
                    case ColorType.TRUECOLOR_ALPHA:
                        color = RGB.from_bits(channels, bit_depth);
                        break;

                    case ColorType.INDEXED_COLOR:
                        const palette = png.palette();
                        color = palette.colors[channels[0]];
                        break;
                }

                if (image_data.pixelFormat === 'rgba-float16') {
                    image_data.data.set(color.rgb(), (y * width + x) * 4);
                } else {
                    image_data.data.set(color.rgb().bytes(), (y * width + x) * 4);
                }
            }
        }

        return image_data;
    }

    static write_image_data(image_data: undefined | ImageData, png: PNG): ByteArray {
        if (!image_data) return new ByteArray(0);

        const {bit_depth, color_type, interlace_method} = png.header();

        const {width, height, data, pixelFormat} = image_data;

        const samples = {
            [ColorType.GREYSCALE]: 1,
            [ColorType.GREYSCALE_ALPHA]: 2,
            [ColorType.TRUECOLOR]: 3,
            [ColorType.TRUECOLOR_ALPHA]: 4,
            [ColorType.INDEXED_COLOR]: 1,
        }[color_type];

        const pixel_bits = bit_depth * samples;
        const pixel_bytes = pixel_bits / 8;
        const scanline_length = 1 + Math.ceil(width * pixel_bytes);
        const raw_length = height * scanline_length;
        const raw = new ByteArray(raw_length);

        for (let y = 0; y < height; y++) {
            raw.align_write_head();
            raw.write_byte(0);

            for (let x = 0; x < width; x++) {
                if (interlace_method) {

                } else {

                }

                const rgba = data.subarray((y * width + x) * 4, (y * width + x + 1) * 4);
                let color: Color = pixelFormat === 'rgba-float16'
                    ? RGB.from(rgba)
                    : RGB.from_bytes(rgba);

                switch (color_type) {
                    case ColorType.GREYSCALE:
                    case ColorType.GREYSCALE_ALPHA:
                        color = color.greyscale();
                        // fall through
                    case ColorType.TRUECOLOR:
                    case ColorType.TRUECOLOR_ALPHA:
                        color.bits(bit_depth)
                            .slice(0, samples)
                            .forEach(c => raw.write_uint(c, bit_depth));
                        break;

                    case ColorType.INDEXED_COLOR:
                        const palette = png.palette();
                        const index = Color.nearest_index(palette.colors, color)
                        raw.write_uint(index, bit_depth);
                        break;
                }
            }
        }

        // @ts-ignore
        return new ByteArray(pako.deflate(raw));
    }

    bytes(png: PNG): ByteArray {
        const data = this.data_bytes(png);
        const bytes = new ByteArray(data.length + 12);

        bytes.write_uint32(data.length);
        bytes.write_chars(this.type);
        bytes.write(data);
        bytes.write_uint32(bytes.crc(4, data.length + 8));

        return bytes;
    }

    abstract data_bytes(png: PNG): ByteArray;
}
