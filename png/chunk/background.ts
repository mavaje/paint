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
                const value = Color.bits_to_scalar(data.read_uint16(), header.bit_depth);
                const color = Greyscale.from([value]);
                return new Background(color);
            }
            case ColorType.TRUECOLOR:
            case ColorType.TRUECOLOR_ALPHA: {
                const color = RGB.from_bits([
                    data.read_uint16(),
                    data.read_uint16(),
                    data.read_uint16(),
                ], header.bit_depth);
                return new Background(color);
            }
            case ColorType.INDEXED_COLOR: {
                const palette = png.palette();
                const index = data.read_byte();
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
                return new ByteArray(2)
                    .write_uint16(value);
            }
            case ColorType.TRUECOLOR:
            case ColorType.TRUECOLOR_ALPHA: {
                const [r, g, b] = this.background.rgb().bits(header.bit_depth);
                return new ByteArray(6)
                    .write_uint16s([r, g, b]);
            }
            case ColorType.INDEXED_COLOR: {
                const palette = png.palette();
                const index = Color.nearest_index(palette.colors, this.background);
                return new ByteArray(1)
                    .write_byte(index);
            }
        }
    }
}
