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
            data.read_uint32(),
            data.read_uint32(),
            data.read_byte() as BitDepth,
            data.read_byte(),
            data.read_byte(),
            data.read_byte(),
            data.read_byte(),
        );
    }

    override data_bytes(): ByteArray {
        return new ByteArray(13)
            .write_uint32(this.width)
            .write_uint32(this.height)
            .write_byte(this.bit_depth)
            .write_byte(this.color_type)
            .write_byte(this.compression_method)
            .write_byte(this.filter_method)
            .write_byte(this.interlace_method);
    }
}
