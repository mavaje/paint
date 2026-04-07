import {Chunk, ChunkType} from "./chunk";
import {ByteArray} from "../../byte-array";
import {Color} from "../../color/color";
import {RGB} from "../../color/rgb";
import {PNG} from "../png";
import {ColorType} from "./header";
import {Greyscale} from "../../color/greyscale";

export class Transparency extends Chunk<ChunkType.TRANSPARENCY> {

    constructor(
        public color: undefined | Color,
    ) {
        super(ChunkType.TRANSPARENCY);
    }

    static from_data_bytes(data: ByteArray, png: PNG): Transparency {
        const {color_type, bit_depth} = png.header();

        switch (color_type) {
            case ColorType.GREYSCALE:
            case ColorType.GREYSCALE_ALPHA: {
                const color = Greyscale.from_bits([
                    data.read_uint16(),
                ], bit_depth);
                return new Transparency(color);
            }

            case ColorType.TRUECOLOR:
            case ColorType.TRUECOLOR_ALPHA: {
                const color = RGB.from_bits([
                    data.read_uint16(),
                    data.read_uint16(),
                    data.read_uint16(),
                ], bit_depth);
                return new Transparency(color);
            }

            case ColorType.INDEXED_COLOR: {
                const palette = png.palette(true);

                for (let i = 0; i < palette.colors.length && data.has_more(); i++) {
                    palette.colors[i][3] = Color.byte_to_scalar(data.read_byte());
                }

                return new Transparency(undefined);
            }
        }
    }

    override data_bytes(png: PNG): undefined | ByteArray {
        const {color_type, bit_depth} = png.header();
        switch (color_type) {
            case ColorType.GREYSCALE: {
                if (!this.color) return undefined;
                const [value] = this.color.greyscale().bits(bit_depth);
                return new ByteArray(2)
                    .write_uint16(value);
            }

            case ColorType.TRUECOLOR: {
                if (!this.color) return undefined;
                const rgb = this.color.rgb().bits(bit_depth);
                return new ByteArray(6)
                    .write_uint16s(rgb);
            }

            case ColorType.INDEXED_COLOR: {
                const palette = png.palette(true);
                return new ByteArray(palette.colors.length)
                    .write(palette.colors.map(color => color.bytes()[3]));
            }
        }

        return undefined;
    }
}
