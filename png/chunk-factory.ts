import {Chunk, ChunkType} from "./chunk/chunk";
import {ByteArray} from "../byte-array";
import {Header} from "./chunk/header";
import {Palette} from "./chunk/palette";
import {Trailer} from "./chunk/trailer";
import {Time} from "./chunk/time";
import {Unknown} from "./chunk/unknown";
import {Data} from "./chunk/data";
import {Background} from "./chunk/background";
import {PNG} from "./png";
import {LayerControl} from "./chunk/layer-control";
import {LayerData} from "./chunk/layer-data";

export class ChunkFactory {

    constructor(protected png: PNG) {}

    from_data<T extends ChunkType>(type: T, data: ByteArray): Chunk<T> {
        const constructor = {
            [ChunkType.HEADER]: Header,
            [ChunkType.PALETTE]: Palette,
            [ChunkType.IMAGE_DATA]: Data,
            [ChunkType.TRAILER]: Trailer,
            [ChunkType.TIME]: Time,
            [ChunkType.BACKGROUND]: Background,
            [ChunkType.LAYER_CONTROL]: LayerControl,
            [ChunkType.LAYER_DATA]: LayerData,
        }[type];

        if (constructor) {
            if (type !== ChunkType.HEADER && !this.png.has_chunk(ChunkType.HEADER)) {
                throw new Error('Header chunk must be first!');
            }

            if (this.png.has_chunk(ChunkType.TRAILER)) {
                throw new Error('Trailer chunk must be last!');
            }

            data.read_head = 0;
            const chunk = constructor.from_data_bytes(data, this.png) as Chunk;

            this.png.push_chunk(chunk);

            return chunk as Chunk<T>;
        } else {
            return new Unknown(type, data);
        }
    }
}
