import {ByteArray} from "../byte-array";
import {Chunk, ChunkType} from "./chunk/chunk";
import {Header} from "./chunk/header";
import {Palette} from "./chunk/palette";
import {Transparency} from "./chunk/transparency";
import {Data} from "./chunk/data";

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

    private chunk<C extends Chunk<ChunkType>>(type: C extends Chunk<infer T> ? T : never, force: true): C;
    private chunk<C extends Chunk<ChunkType>>(type: C extends Chunk<infer T> ? T : never, force?: boolean): undefined | C;
    private chunk<C extends Chunk<ChunkType>>(type: C extends Chunk<infer T> ? T : never, force: boolean = false): undefined | C {
        const chunk = this.chunk_map[type]?.[0];

        if (force && !chunk) {
            throw new Error(`Chunk of type ${type} is not defined!`);
        }

        return chunk as Chunk as C;
    }

    header(): Header {
        return this.chunk(ChunkType.HEADER, true);
    }

    palette(force: true): Palette;
    palette(force?: boolean): undefined | Palette;
    palette(force: boolean = false): undefined | Palette {
        return this.chunk(ChunkType.PALETTE, force);
    }

    transparency(): undefined | Transparency {
        return this.chunk(ChunkType.TRANSPARENCY);
    }

    image_data(): Data {
        return this.chunk(ChunkType.IMAGE_DATA, true);
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
