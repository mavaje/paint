import {Chunk, ChunkType} from "./chunk";
import {ByteArray} from "../../byte-array";

export class Time extends Chunk<ChunkType.TIME> {

    constructor(
        public timestamp: Date = new Date(),
    ) {
        super(ChunkType.TIME);
    }

    static from_data_bytes(data: ByteArray): Time {
        const epoch = Date.UTC(
            data.read_uint16(),
            data.read_byte(),
            data.read_byte(),
            data.read_byte(),
            data.read_byte(),
            data.read_byte(),
        );

        return new Time(new Date(epoch));
    }

    override data_bytes(): ByteArray {
        return new ByteArray(7)
            .write_uint16(this.timestamp.getUTCFullYear())
            .write_byte(this.timestamp.getUTCMonth())
            .write_byte(this.timestamp.getUTCDate())
            .write_byte(this.timestamp.getUTCHours())
            .write_byte(this.timestamp.getUTCMinutes())
            .write_byte(this.timestamp.getUTCSeconds());
    }
}
