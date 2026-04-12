import {Chunk, ChunkType} from "./chunk";
import {ByteArray} from "../../byte-array";
import {PNG} from "../png";

export class Data extends Chunk<ChunkType.IMAGE_DATA> {

    constructor(
        public image_data?: ImageData,
    ) {
        super(ChunkType.IMAGE_DATA);
    }

    static from_data_bytes(data: ByteArray, png: PNG): Data {
        return new Data(
            this.read_image_data(data, png, {decompress: false}),
        );
    }

    override data_bytes(png: PNG): ByteArray {
        return Chunk.write_image_data(this.image_data, png);
    }
}
