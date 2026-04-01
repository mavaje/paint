import {Chunk, ChunkType} from "./chunk";
import {ByteArray} from "../../byte-array";

export type BitDepth = 1 | 2 | 4 | 8 | 16;

export enum ColorType {
    GREYSCALE = 0,
    TRUECOLOR = 2,
    INDEXED_COLOR = 3,
    GREYSCALE_ALPHA = 4,
    TRUECOLOR_ALPHA = 6,
}

export enum CompressionMethod {
    DEFLATE = 0,
}

export enum FilterMethod {
    ADAPTIVE = 0,
}

export enum InterlaceMethod {
    NONE = 0,
    ADAM7 = 1,
}

export class Header extends Chunk<ChunkType.HEADER> {

    constructor(
        public width: number = 0,
        public height: number = 0,
        public bit_depth: BitDepth = 8,
        public color_type: ColorType = ColorType.TRUECOLOR_ALPHA,
        public compression_method: CompressionMethod = CompressionMethod.DEFLATE,
        public filter_method: FilterMethod = FilterMethod.ADAPTIVE,
        public interlace_method: InterlaceMethod = InterlaceMethod.NONE,
    ) {
        super(ChunkType.HEADER);
    }

    static from_data_bytes(data: ByteArray): Header {
        return new Header(
            data.integer(0, 4),
            data.integer(4, 4),
            data.byte(8) as BitDepth,
            data.byte(9),
            data.byte(10),
            data.byte(11),
            data.byte(12),
        );
    }

    override data_bytes(): ByteArray {
        const bytes = new ByteArray(13);
        bytes.set(this.width, 0, 4);
        bytes.set(this.height, 4, 4);
        bytes.set(this.bit_depth, 8, 1);
        bytes.set(this.color_type, 9, 1);
        bytes.set(this.compression_method, 10, 1);
        bytes.set(this.filter_method, 11, 1);
        bytes.set(this.interlace_method, 12, 1);
        return bytes;
    }
}
