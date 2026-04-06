import {Chunk, ChunkType} from "./chunk";
import {ByteArray} from "../../byte-array";

export class LayerControl extends Chunk<ChunkType.LAYER_CONTROL> {

    constructor(
        public layer_count: number,
    ) {
        super(ChunkType.LAYER_CONTROL);
    }

    static from_data_bytes(data: ByteArray): LayerControl {
        return new LayerControl(
            data.read_byte(),
        );
    }

    override data_bytes(): ByteArray {
        return new ByteArray(1)
            .write_byte(this.layer_count);
    }
}
