import {Chunk, ChunkType} from "./chunk/chunk";
import {Header} from "./chunk/header";
import {Palette} from "./chunk/palette";

export class ChunkMap {

    chunks: Chunk[] = [];
    map: {
        [K in ChunkType]?: Chunk<K>[];
    } = {};

    push<T extends ChunkType>(chunk: Chunk<T>) {
        this.chunks.push(chunk);
        ((this.map[chunk.type] ??= []) as Chunk<T>[]).push(chunk as Chunk<T>);
    }

    has_chunk(type: ChunkType): boolean {
        return (this.map[type]?.length ?? 0) > 0;
    }

    header(): Header {
        const header = this.map[ChunkType.HEADER]?.[0];

        if (!header) {
            throw new Error('Header chunk must be first!');
        }

        return header as Header;
    }

    palette(): Palette {
        const palette = this.map[ChunkType.PALETTE]?.[0];

        if (!palette) {
            throw new Error('Palette chunk is not defined!');
        }

        return palette as Palette;
    }
}
