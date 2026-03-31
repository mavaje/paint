import {ByteArray} from "../byte-array";
import {Chunk, ChunkType} from "./chunk/chunk";
import {Header} from "./chunk/header";
import {End} from "./chunk/end";
import {Unknown} from "./chunk/unknown";
import {Time} from "./chunk/time";

export class PNG {

    static readonly SIGNATURE = ByteArray.from_bytes([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    ]);

    chunks: Chunk[] = [];

    static create(
        width: number,
        height: number,
    ) {
        const png = new PNG();
        png.chunks.push(new Header(width, height));
        png.chunks.push(new Time());
    }

    static from_bytes(bytes: ArrayLike<number>): PNG {
        if (!PNG.SIGNATURE.every((byte, i) => byte === bytes[i])) {
            throw new Error('Incorrect PNG signature!');
        }

        const png = new PNG();
        let index = 8;
        const byte_array = new ByteArray(bytes);

        while (index < bytes.length) {
            const length = byte_array.integer(index, 4);
            const type = byte_array.string(index + 4, 4) as ChunkType;
            const data = byte_array.sub(index + 8, index + length + 8);
            const crc = byte_array.integer(index + length + 8, 4);

            if (crc !== Chunk.crc(byte_array.sub(index + 4, index + length + 8))) {
                throw new Error(`Incorrect CRC for chunk ${type}`);
            }

            let chunk: Chunk;
            switch (type) {
                case ChunkType.HEADER:
                    chunk = Header.from_data_bytes(data);
                    break;

                case ChunkType.END:
                    chunk = new End();
                    break;

                case ChunkType.TIME:
                    chunk = Time.from_data_bytes(data);
                    break;

                default:
                    chunk = new Unknown(type, data);
            }

            png.chunks.push(chunk);

            console.log(`${chunk.type} (${length}):`);
            console.log(chunk.bytes().toString());

            index += length + 12;
        }

        return png;
    }

    first_chunk<T extends ChunkType>(type: T): undefined|Chunk<T> {
        for (const chunk of this.chunks) {
            if (chunk.type === type) return chunk as Chunk<T>;
        }
        return undefined;
    }

    header(): Header {
        return this.first_chunk(ChunkType.HEADER) as Header;
    }

    bytes() {
        const chunks: ByteArray[] = [
            PNG.SIGNATURE,
            ...this.chunks.map(chunk => chunk.bytes()),
        ];

        const length = chunks.reduce((l, c) => l + c.length, 0);

        const bytes = new ByteArray(length);

        let offset = 0;
        chunks.forEach(chunk => {
            bytes.set(chunk, offset);
            offset += chunk.length;
        });

        return bytes;
    }
}
