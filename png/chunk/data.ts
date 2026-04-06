import {Chunk, ChunkType} from "./chunk";
import {ByteArray} from "../../byte-array";
import {PNG} from "../png";

export class Data extends Chunk<ChunkType.IMAGE_DATA> {

    constructor(
        public image_data: undefined | ImageData,
        public dx: number = 0,
        public dy: number = 0,
    ) {
        super(ChunkType.IMAGE_DATA);
    }

    static from_data_bytes(data: ByteArray, png: PNG): Data {
        const image_data = this.read_image_data(data, png);

        const data_chunks = png.chunk_map[ChunkType.IMAGE_DATA] as Data[] ?? [];
        const last_data = data_chunks[data_chunks.length - 1];
        return new Data(
            image_data,
            0,
            last_data ? last_data.dy + (last_data.image_data?.height ?? 0) : 0,
        );
    }

    override data_bytes(png: PNG): ByteArray {
        return Chunk.write_image_data(this.image_data, png);
    }
}
