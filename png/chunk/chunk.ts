import crc32 from "crc-32";

import {ByteArray} from "../../byte-array";

export enum ChunkType {
    HEADER = 'IHDR',
    PALETTE = 'PLTE',
    IMAGE_DATA = 'IDAT',
    END = 'IEND',
    TIME = 'tIME',
}

export abstract class Chunk<T extends ChunkType = ChunkType> {

    protected constructor(public type: T) {}

    static crc(bytes: ByteArray) {
        return crc32.buf(new Uint8Array(bytes)) & 0xFFFFFFFF;
    }

    bytes(): ByteArray {
        const data = this.data_bytes();
        const bytes = new ByteArray(data.length + 12);

        bytes.set(data.length, 0, 4);
        bytes.set(this.type, 4, 4);
        bytes.set(data, 8);

        const crc = Chunk.crc(bytes.sub(4, -4));
        bytes.set(crc, -4, 4);

        return bytes;
    }

    abstract data_bytes(): ByteArray;
}
