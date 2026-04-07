import crc32 from "crc-32";

export class ByteArray extends Uint8ClampedArray {

    read_head: number = 0;
    write_head: number = 0;

    align_read_head() {
        this.read_head = Math.ceil(this.read_head);
        return this;
    }

    read_bool(offset = this.read_head): boolean {
        this.read_head = offset + 1;
        return this[offset] > 0;
    }

    read_bit(bit_offset = this.read_head * 8): number {
        this.read_head = (bit_offset + 1) / 8;
        return this[Math.floor(bit_offset / 8)] >> (7 - (bit_offset % 8)) & 0b1;
    }

    read_uint2(bit_offset = this.read_head * 8): number {
        this.read_head = (bit_offset + 2) / 8;
        return (this[Math.floor(bit_offset / 8)] >> (6 - (bit_offset % 8)) & 0b11);
    }

    read_uint4(bit_offset = this.read_head * 8): number {
        this.read_head = (bit_offset + 4) / 8;
        return (this[Math.floor(bit_offset / 8)] >> (4 - (bit_offset % 8)) & 0b1111);
    }

    read_byte(offset = this.read_head): number {
        this.read_head = offset + 1;
        return this[offset] || 0;
    }

    read_uint16(offset = this.read_head): number {
        this.read_head = offset + 2;
        return this[offset] << 8
            | this[offset + 1];
    }

    read_uint32(offset = this.read_head): number {
        this.read_head = offset + 4;
        return this[offset] << 24
            | this[offset + 1] << 16
            | this[offset + 2] << 8
            | this[offset + 3];
    }

    read_uint(bit_depth: number, bit_offset = this.read_head * 8): number {
        this.read_head = (bit_offset + bit_depth) / 8;
        const index = Math.floor(bit_offset / 8);
        if (bit_depth < 8) {
            return (this[Math.floor(bit_offset / 8)] >> (8 - bit_depth - (bit_offset % 8)) & ((1 << bit_depth) - 1));
        } else if (bit_depth > 8) {
            let result = 0;
            for (let b = 0; b < bit_depth / 8; b++) {
                result |= this[index + b] << bit_depth - (b + 1) * 8;
            }
            return result;
        } else {
            return this[index];
        }
    }

    read_chars(length: number, offset = this.read_head): string {
        return String.fromCharCode(...this.slice(offset, offset + length));
    }

    read(length?: number, offset = this.read_head): number[] {
        length ??= this.length - offset;
        this.read_head = offset + length;
        return [...this.slice(offset, offset + length)];
    }

    has_more(): boolean {
        return this.read_head < this.length;
    }

    align_write_head() {
        this.write_head = Math.ceil(this.write_head);
        return this;
    }

    write_bool(value: boolean, offset = this.write_head): this {
        this.write_head = offset + 1;
        this[offset] = value ? 1 : 0;
        return this;
    }

    write_bit(value: number, bit_offset = this.write_head * 8): this {
        this.write_head = (bit_offset + 1) / 8;
        const index = Math.floor(bit_offset / 8);
        const shift = (7 - (bit_offset % 8));
        this[index] = this[index] & 0xFF - (0b1 << shift)
            | (value & 0b1) << shift;
        return this;
    }

    write_uint2(value: number, bit_offset = this.write_head * 8): this {
        this.write_head = (bit_offset + 2) / 8;
        const index = Math.floor(bit_offset / 8);
        const shift = (6 - (bit_offset % 8));
        this[index] = this[index] & 0xFF - (0b11 << shift)
            | (value & 0b11) << shift;
        return this;
    }

    write_uint4(value: number, bit_offset = this.write_head * 8): this {
        this.write_head = (bit_offset + 4) / 8;
        const index = Math.floor(bit_offset / 8);
        const shift = (4 - (bit_offset % 8));
        this[index] = this[index] & 0xFF - (0b1111 << shift)
            | (value & 0b1111) << shift;
        return this;
    }

    write_byte(value: number, offset = this.write_head): this {
        this.write_head = offset + 1;
        this[offset] = value & 0xFF;
        return this;
    }

    write_uint16(value: number, offset = this.write_head): this {
        this.write_head = offset + 2;
        this[offset] = value >> 8 & 0xFF;
        this[offset + 1] = value & 0xFF;
        return this;
    }

    write_uint32(value: number, offset = this.write_head): this {
        this.write_head = offset + 4;
        this[offset] = value >> 24 & 0xFF;
        this[offset + 1] = value >> 16 & 0xFF;
        this[offset + 2] = value >> 8 & 0xFF;
        this[offset + 3] = value & 0xFF;
        return this;
    }

    write_uint(value: number, bit_depth: number, bit_offset = this.write_head * 8): this {
        this.write_head = (bit_offset + bit_depth) / 8;
        const index = Math.floor(bit_offset / 8);
        if (bit_depth < 8) {
            const shift = (8 - bit_depth - (bit_offset % 8));
            this[index] = this[index] & 0xFF - ((1 << bit_depth) - 1 << shift)
                | (value & (1 << bit_depth) - 1) << shift;
        } else if (bit_depth > 8) {
            for (let b = 0; b < bit_depth / 8; b++) {
                this[index + b] = (value >> bit_depth - b * 8) & 0xFF;
            }
        } else {
            this[index] = value;
        }
        return this;
    }

    write_chars(value: string, offset = this.write_head): this {
        this.write_head = offset + value.length;
        for (let i = 0; i < value.length; i++) {
            this[offset + i] = value.charCodeAt(i);
        }
        return this;
    }

    write(value: ArrayLike<number>, offset = this.write_head): this {
        this.write_head = offset + value.length;
        this.set(value, offset);
        return this;
    }

    write_uint16s(values: ArrayLike<number>, offset = this.write_head) {
        this.write_head = offset;
        for (let i = 0; i < values.length; i++) {
            this.write_uint16(values[i]);
        }
        return this;
    }

    write_uint32s(values: ArrayLike<number>, offset = this.write_head) {
        this.write_head = offset;
        for (let i = 0; i < values.length; i++) {
            this.write_uint32(values[i]);
        }
        return this;
    }

    crc(start: number, end: number): number {
        const crc_bytes = this.slice(start, end);
        return crc32.buf(new Uint8Array(crc_bytes)) & 0xFFFFFFFF;
    }

    override slice(start?: number, end?: number): ByteArray {
        return new ByteArray(super.slice(start, end));
    }

    override toString(): string {
        let string = '';
        for (let y = 0; y === 0 || y * 16 < this.length && y <= 0xFFFF; y++) {
            const row = this.slice(y * 16, (y + 1) * 16).read();
            string += y.toString(16).padStart(4, '0') + 'h: ';
            string += row
                .map(v => v.toString(16).padStart(2, '0'))
                .join(' ')
                .padEnd(47, ' ');
            string += ' | ';
            string += row
                .map(v => v >= 32 && v < 127 ? String.fromCharCode(v) : '.')
                .join('');
            string += '\n';
        }
        return string;
    }
}
