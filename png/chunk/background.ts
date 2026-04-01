import {Chunk, ChunkType} from "./chunk";
import {ByteArray} from "../../byte-array";
import {Color} from "../../color/color";
import {ColorType} from "./header";
import {RGB} from "../../color/rgb";
import {PNG} from "../png";
import {Greyscale} from "../../color/greyscale";

export class Background extends Chunk<ChunkType.BACKGROUND> {

    constructor(
        public background: Color,
    ) {
        super(ChunkType.BACKGROUND);
    }

    static from_data_bytes(data: ByteArray, png: PNG): Background {
        const header = png.header();
        switch (header.color_type) {
            case ColorType.GREYSCALE:
            case ColorType.GREYSCALE_ALPHA: {
                const value = Color.bits_to_scalar(data.integer(), header.bit_depth);
                const color = Greyscale.from([value]);
                return new Background(color);
            }
            case ColorType.TRUECOLOR:
            case ColorType.TRUECOLOR_ALPHA: {
                const rgb = data.chunk_map(2, b =>
                    Color.bits_to_scalar(b.integer(), header.bit_depth));
                const color = RGB.from(rgb);
                return new Background(color);
            }
            case ColorType.INDEXED_COLOR: {
                const palette = png.palette();
                const index = data.byte();
                const color = palette.colors[index];
                return new Background(color);
            }
        }
    }

    override data_bytes(png: PNG): ByteArray {
        const header = png.header();
        switch (header.color_type) {
            case ColorType.GREYSCALE:
            case ColorType.GREYSCALE_ALPHA: {
                const [value] = this.background.greyscale().bits(header.bit_depth);
                return ByteArray.from_integer(value, 2);
            }
            case ColorType.TRUECOLOR:
            case ColorType.TRUECOLOR_ALPHA: {
                const [r, g, b] = this.background.rgb().bits(header.bit_depth);
                const bytes = new ByteArray(6);
                bytes.set(r, 0, 2);
                bytes.set(g, 2, 2);
                bytes.set(b, 4, 2);
                return bytes;
            }
            case ColorType.INDEXED_COLOR: {
                const palette = png.palette();
                const index = Color.nearest_index(palette.colors, this.background);
                return ByteArray.from_byte(index);
            }
        }
    }
}
