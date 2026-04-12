import {Chunk, ChunkType} from "./chunk";
import {ByteArray} from "../../byte-array";

export class Text extends Chunk<ChunkType.TEXT> {

    constructor(
        public keyword: string,
        public text: string,
    ) {
        super(ChunkType.TEXT);
    }

    static from_data_bytes(data: ByteArray): Text {
        return new Text(
            data.read_terminated_chars(),
            data.read_chars(),
        );
    }

    data_bytes(): ByteArray {
        return new ByteArray(this.keyword.length + 1 + this.text.length)
            .write_terminated_chars(this.keyword.slice(0, 79))
            .write_chars(this.text);
    }
}
