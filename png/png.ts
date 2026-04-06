import {ByteArray} from "../byte-array";
import {Chunk, ChunkType} from "./chunk/chunk";
import {Header} from "./chunk/header";
import {Palette} from "./chunk/palette";

export class PNG {

    static readonly SIGNATURE = new ByteArray(8)
        .write([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        ]);

    chunks: Chunk[] = [];
    chunk_map: {
        [K in ChunkType]?: Chunk<K>[];
    } = {};

    push_chunk<T extends ChunkType>(chunk: Chunk<T>) {
        this.chunks.push(chunk);
        ((this.chunk_map[chunk.type] ??= []) as Chunk<T>[]).push(chunk as Chunk<T>);
    }

    has_chunk(type: ChunkType): boolean {
        return (this.chunk_map[type]?.length ?? 0) > 0;
    }

    header(): Header {
        const header = this.chunk_map[ChunkType.HEADER]?.[0];

        if (!header) {
            throw new Error('Header chunk must be first!');
        }

        return header as Header;
    }

    palette(): Palette {
        const palette = this.chunk_map[ChunkType.PALETTE]?.[0];

        if (!palette) {
            throw new Error('Palette chunk is not defined!');
        }

        return palette as Palette;
    }

    bytes() {
        const chunks: ByteArray[] = [
            PNG.SIGNATURE,
            ...this.chunks.map(chunk => chunk.bytes(this)),
        ];

        const length = chunks.reduce((l, c) => l + c.length, 0);

        const bytes = new ByteArray(length);

        chunks.forEach(chunk => bytes.write(chunk));

        return bytes;
    }
}
