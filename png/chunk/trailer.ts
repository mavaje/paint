import {Chunk, ChunkType} from "./chunk";
import {ByteArray} from "../../byte-array";

export class Trailer extends Chunk<ChunkType.TRAILER> {

    constructor() {
        super(ChunkType.TRAILER);
    }

    static from_data_bytes(): Trailer {
        return new Trailer();
    }

    data_bytes(): ByteArray {
        return new ByteArray(0);
    }
}
