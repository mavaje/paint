import {Chunk, ChunkType} from "./chunk";
import {ByteArray} from "../../byte-array";
import {Color} from "../../color/color";
import {RGB} from "../../color/rgb";

export class Palette extends Chunk<ChunkType.PALETTE> {

    constructor(
        public colors: Color[],
    ) {
        super(ChunkType.PALETTE);
    }

    static from_data_bytes(data: ByteArray): Palette {
        if (data.length % 3 > 0) {
            throw new Error(`Invalid palette length: ${data.length}`);
        }

        const colours: Color[] = [];

        while (data.has_more()) {
            colours.push(RGB.from_bytes(data.read(3)));
        }

        return new Palette(colours);
    }

    override data_bytes(): ByteArray {
        const bytes = new ByteArray(this.colors.length * 3);
        this.colors.forEach(color =>
            bytes.write(color.rgb().bytes().slice(0, 3)));
        return bytes;
    }
}
