import {Chunk, ChunkType} from "./chunk";
import {ByteArray} from "../../byte-array";

export class Time extends Chunk<ChunkType.TIME> {

    constructor(
        public timestamp: Date = new Date(),
    ) {
        super(ChunkType.TIME);
    }

    static from_data_bytes(bytes: ByteArray): Time {
        const epoch = Date.UTC(
            bytes.integer(0, 2),
            bytes.byte(2),
            bytes.byte(3),
            bytes.byte(4),
            bytes.byte(5),
            bytes.byte(6),
        );

        return new Time(new Date(epoch));
    }

    override data_bytes(): ByteArray {
        const bytes = new ByteArray(7);
        bytes.set(this.timestamp.getUTCFullYear(), 0, 2);
        bytes.set(this.timestamp.getUTCMonth(), 2, 1);
        bytes.set(this.timestamp.getUTCDate(), 3, 1);
        bytes.set(this.timestamp.getUTCHours(), 4, 1);
        bytes.set(this.timestamp.getUTCMinutes(), 5, 1);
        bytes.set(this.timestamp.getUTCSeconds(), 6, 1);
        return bytes;
    }
}
