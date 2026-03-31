import {Chunk, ChunkType} from "./chunk";
import {ByteArray} from "../../byte-array";

export class Unknown<T extends ChunkType> extends Chunk<T> {

    constructor(
        type: T,
        private data: ByteArray,
    ) {
        super(type);
    }

    data_bytes(): ByteArray {
        return this.data;
    }
}
