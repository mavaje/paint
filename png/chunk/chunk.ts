import crc32 from "crc-32";

import {ByteArray} from "../../byte-array";
import {PNG} from "../png";
import {ColorType, InterlaceMethod} from "./header";
import {RGB} from "../../color/rgb";
import {Color} from "../../color/color";
import pako from "pako";
import {Greyscale} from "../../color/greyscale";
import {supports_float16_color} from "../../browser";
import {Palette} from "./palette";
import {mod} from "../../math";

export enum ChunkType {
    HEADER = 'IHDR',
    PALETTE = 'PLTE',
    IMAGE_DATA = 'IDAT',
    TRAILER = 'IEND',
    TRANSPARENCY = 'tRNS',
    HISTOGRAM = 'hIST',
    BACKGROUND = 'bKGD',
    TEXT= 'tEXt',
    COMPRESSED_TEXT= 'zTXt',
    INTERNATIONAL_TEXT= 'zTXt',
    TIME = 'tIME',
    LAYER_CONTROL = 'lcTL',
    LAYER_DATA = 'ldAT',
}

function filter(type: number, a: number, b: number, c: number): number {
    switch (type) {
        case 0:
            return 0;
        case 1:
            return a;
        case 2:
            return b;
        case 3:
            return (a + b) >> 1;
        case 4:
            return paeth_predictor(a, b, c);
        default:
            throw new Error(`Invalid filter type ${type}`);
    }
}

function paeth_predictor(a: number, b: number, c: number): number {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) {
        return a;
    } else if (pb <= pc) {
        return b;
    } else {
        return c;
    }
}

type Pass = {
    px: number;
    py: number;
    ox: number;
    oy: number;
    x_count: number;
    y_count: number;
    threshold: number;
    count: number;
}

function interlace_passes(width: number, height: number): Pass[] {
    let threshold: number = 0;
    return [
        {px: 8, py: 8, ox: 0, oy: 0},
        {px: 8, py: 8, ox: 4, oy: 0},
        {px: 4, py: 8, ox: 0, oy: 4},
        {px: 4, py: 4, ox: 2, oy: 0},
        {px: 2, py: 4, ox: 0, oy: 2},
        {px: 2, py: 2, ox: 1, oy: 0},
        {px: 1, py: 2, ox: 0, oy: 1},
    ].map(({px, py, ox, oy}) => {
        const x_count = Math.floor((width + px - ox - 1) / px);
        const y_count = Math.floor((height + py - oy - 1) / py);
        const count = x_count * y_count;
        threshold += count;
        return {
            px, py,
            ox, oy,
            x_count, y_count,
            threshold,
            count,
        };
    });
}

export abstract class Chunk<T extends ChunkType = ChunkType> {

    protected constructor(
        public type: T,
    ) {}

    static crc(bytes: ByteArray) {
        return crc32.buf(new Uint8Array(bytes)) & 0xFFFFFFFF;
    }

    static read_image_data(data: ByteArray, png: PNG, options: {
        decompress?: boolean,
    } = {}): undefined | ImageData {
        const {width, bit_depth, color_type, interlace_method} = png.header();

        let filtered = options.decompress ?? true
            // @ts-ignore
            ? new ByteArray(pako.inflate(data))
            : data;

        const samples = {
            [ColorType.GREYSCALE]: 1,
            [ColorType.GREYSCALE_ALPHA]: 2,
            [ColorType.TRUECOLOR]: 3,
            [ColorType.TRUECOLOR_ALPHA]: 4,
            [ColorType.INDEXED_COLOR]: 1,
        }[color_type];

        const pixel_bits = bit_depth * samples;
        const pixel_bytes = pixel_bits / 8;
        const scanline_bytes = Math.ceil(width * pixel_bytes);
        const scanline_length = 1 + scanline_bytes;
        const height = filtered.length / scanline_length;

        if (height === 0) return undefined;

        const raw = new ByteArray(height * scanline_bytes);

        const filter_offset = Math.max(1, pixel_bytes);

        for (let y = 0; y < height; y++) {
            filtered.read_head = y * scanline_length;
            raw.write_head = y * scanline_bytes;

            const filter_type = filtered.read_byte();

            for (let x = 0; x < scanline_bytes; x++) {
                const a = x >= filter_offset
                    ? raw[y * scanline_bytes + x - filter_offset]
                    : 0;
                const b = y > 0
                    ? raw[(y - 1) * scanline_bytes + x]
                    : 0;
                const c = x >= filter_offset && y > 0
                    ? raw[(y - 1) * scanline_bytes + x - filter_offset]
                    : 0;
                raw.write_byte(mod(filtered.read_byte() + filter(filter_type, a, b, c), 256));
            }
        }

        const image_data = new ImageData(width, height, {
            pixelFormat: bit_depth > 8 && supports_float16_color()
                ? 'rgba-float16'
                : 'rgba-unorm8'
        });

        const palette = png.palette(color_type === ColorType.INDEXED_COLOR);

        const passes = interlace_passes(width, height);
        let pass_index: number = 0;
        let pass: Pass = passes[pass_index];

        for (let y = 0; y < height; y++) {
            raw.align_read_head();

            for (let x = 0; x < width; x++) {

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
                        color = (palette as Palette).colors[channels[0]];
                        break;
                }

                let pixel_index = y * width + x;
                switch (interlace_method) {
                    case InterlaceMethod.ADAM7:
                        let index = y * width + x;
                        if (index >= pass.threshold) {
                            pass = passes[++pass_index];
                        }
                        const px = pass.px * (index % pass.x_count) + pass.ox;
                        const py = pass.py * Math.floor(index / pass.x_count) + pass.oy;
                        pixel_index = py * width + px;
                        break;
                }

                if (image_data.pixelFormat === 'rgba-float16') {
                    image_data.data.set(color.rgb(), pixel_index * 4);
                } else {
                    image_data.data.set(color.rgb().bytes(), pixel_index * 4);
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

        const palette = png.palette(color_type === ColorType.INDEXED_COLOR);
        // const transparency = png.transparency();

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
                        const index = Color.nearest_index((palette as Palette).colors, color);
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
        if (!data) return new ByteArray(0);

        const bytes = new ByteArray(data.length + 12);

        bytes.write_uint32(data.length);
        bytes.write_chars(this.type);
        bytes.write(data);
        bytes.write_uint32(bytes.crc(4, data.length + 8));

        return bytes;
    }

    abstract data_bytes(png: PNG): undefined | ByteArray;
}
