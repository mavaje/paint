import {Chunk, ChunkType} from "./chunk";
import {ByteArray} from "../../byte-array";

export class End extends Chunk<ChunkType.END> {

    constructor() {
        super(ChunkType.END);
    }

    data_bytes(): ByteArray {
        return new ByteArray(0);
    }
}
