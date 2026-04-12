import {Chunk, ChunkType} from "./chunk/chunk";
import {ByteArray} from "../byte-array";
import {Header} from "./chunk/header";
import {Palette} from "./chunk/palette";
import {Unknown} from "./chunk/unknown";
import {Data} from "./chunk/data";
import {PNG} from "./png";
import {LayerControl} from "./chunk/layer-control";
import {LayerData} from "./chunk/layer-data";
import {Transparency} from "./chunk/transparency";
import pako, {Inflate} from "pako";

export class ChunkFactory {

    private image_data_inflator?: Inflate;

    constructor(protected png: PNG) {}

    from_data<T extends ChunkType>(type: T, data: ByteArray): void {
        if (type === ChunkType.IMAGE_DATA) {
            this.image_data_inflator ??= new pako.Inflate();
            // @ts-ignore
            this.image_data_inflator.push(data);

            return;
        } else if (this.image_data_inflator) {
            const raw = new ByteArray(this.image_data_inflator.result as Uint8Array);
            const data_chunk = Data.from_data_bytes(raw, this.png);

            this.png.push_chunk(data_chunk);
        }

        const constructor = ({
            [ChunkType.HEADER]: Header,
            [ChunkType.PALETTE]: Palette,
            [ChunkType.TRANSPARENCY]: Transparency,
            [ChunkType.IMAGE_DATA]: Data,
            [ChunkType.LAYER_CONTROL]: LayerControl,
            [ChunkType.LAYER_DATA]: LayerData,
        } as Partial<Record<ChunkType, {
            from_data_bytes(data: ByteArray, png: PNG): Chunk;
        }>>)[type];

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
        } else {
            this.png.push_chunk(new Unknown(type, data));
        }
    }
}
