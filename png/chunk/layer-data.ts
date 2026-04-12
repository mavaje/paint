import {Chunk, ChunkType} from "./chunk";
import {ByteArray} from "../../byte-array";
import {PNG} from "../png";

const BLEND_MODES: GlobalCompositeOperation[] = [
    'source-over',
];

export class LayerData extends Chunk<ChunkType.LAYER_DATA> {

    constructor(
        public layer_index: number,
        public name: string,
        public opacity: number,
        public blend_mode: GlobalCompositeOperation,
        public image_data?: ImageData,
    ) {
        super(ChunkType.LAYER_DATA);
    }

    static from_data_bytes(data: ByteArray, png: PNG): LayerData {
        return new LayerData(
            data.read_byte(),
            data.read_terminated_chars(),
            data.read_byte(),
            BLEND_MODES[data.read_byte()],
            this.read_image_data(data.slice(3), png),
        );
    }

    override data_bytes(png: PNG): ByteArray {
        const image_data = Chunk.write_image_data(this.image_data, png);
        return new ByteArray(3 + image_data.length)
            .write_byte(this.layer_index)
            .write_terminated_chars(this.name.slice(0, 79))
            .write_byte(this.opacity * 255)
            .write_byte(BLEND_MODES.indexOf(this.blend_mode))
            .write(image_data);
    }
}
