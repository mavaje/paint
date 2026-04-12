import {Chunk, ChunkType} from "./chunk";
import {ByteArray} from "../../byte-array";
import {CompressionMethod} from "./header";
import pako from "pako";

export class CompressedText extends Chunk<ChunkType.COMPRESSED_TEXT> {

    constructor(
        public keyword: string,
        public compression_method: CompressionMethod,
        public text: string,
    ) {
        super(ChunkType.COMPRESSED_TEXT);
    }

    static from_data_bytes(data: ByteArray): CompressedText {
        return new CompressedText(
            data.read_terminated_chars(),
            data.read_byte(),
            // @ts-ignore
            pako.inflate(data.read()),
        );
    }

    data_bytes(): ByteArray {
        return new ByteArray(this.keyword.length + 1 + this.text.length)
            .write_terminated_chars(this.keyword.slice(0, 79))
            .write_byte(this.compression_method)
            .write(pako.deflate(this.text));
    }
}
