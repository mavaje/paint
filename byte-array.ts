
export class ByteArray extends Uint8ClampedArray {

    static from_byte(byte: number): ByteArray {
        return ByteArray.from_integer(byte, 1);
    }

    static from_integer(value: number, length: number): ByteArray {
        const array = new ByteArray(length);
        array.set(value, 0, length);
        return array;
    }

    static from_string(value: string): ByteArray {
        const array = new ByteArray(value.length);
        array.set(value, 0, value.length);
        return array;
    }

    static from_bytes(value: ArrayLike<number>): ByteArray {
        const array = new ByteArray(value.length);
        array.set(value);
        return array;
    }

    override set(value: boolean, offset?: number, length?: number): void;
    override set(value: number, offset?: number, length?: number): void;
    override set(value: string, offset?: number, length?: number): void;
    override set(value: ArrayLike<number>, offset?: number): void;
    override set(
        value: boolean | number | string | ArrayLike<number>,
        offset: number = 0,
        length?: number,
    ): void {
        offset = offset % this.length;
        if (offset < 0 && this.length > 0) offset += this.length;
        switch (typeof value) {
            case 'boolean':
                value = value ? 1 : 0;
            // fall through
            case 'number':
                length ??= 1;
                for (let byte = 0; byte < length; byte++) {
                    this[offset + byte] = (value >>> (8 * (length - byte - 1))) & 0xFF;
                }
                break;
            case 'string':
                length ??= value.length;
                for (let byte = 0; byte < length; byte++) {
                    this[offset + byte] = value.charCodeAt(byte);
                }
                break;
            default:
                super.set(value, offset);
        }
    }

    sub(start: number = 0, end: number = this.length): ByteArray {
        while (end < 0) end += this.length;
        end = Math.min(end, this.length);
        const length = Math.max(end - start, 0);
        const sub = new ByteArray(length);
        sub.set(this.subarray(start, end));
        return sub;
    }

    chunk_map<T>(
        chunk_size: number,
        callback: (chunk: ByteArray, i: number) => T,
    ): T[] {
        const result = [];
        for (let i = 0; i < this.length; i += chunk_size) {
            const chunk = this.sub(i, i + chunk_size);
            result.push(callback(chunk, i));
        }
        return result;
    }

    chunk_bits<T>(
        bit_depth: number,
        callback: (bits: number, i: number) => T,
    ): T[] {
        const result = [];
        const bit_mask = 1 << bit_depth;
        for (let i = 0; i < this.length; i++) {
            const byte = this.byte(i);
            for (let b = 0; b < 8; b += bit_depth) {
                const bits = (byte << b) & bit_mask;
                result.push(callback(bits, i * 8 / bit_depth + b));
            }
        }
        return result;
    }

    boolean(offset: number = 0): boolean {
        return this[offset] > 0;
    }

    byte(offset: number = 0): number {
        return this[offset];
    }

    integer(): number;
    integer(start: number, length: number): number;
    integer(start: number = 0, length: number = this.length - start): number {
        let value = 0;
        for (let i = 0; i < length; i++) {
            value <<= 8;
            value |= this[start + i];
        }
        return value;
    }

    string(): string;
    string(start: number, length: number): string;
    string(start: number = 0, length: number = this.length - start): string {
        const end = length ? start + length : 0;
        return String.fromCharCode(...this.sub(start, end));
    }

    to_array(): number[] {
        return [...this];
    }

    override toString(): string {
        const row_padding = Math.ceil(Math.log2(this.length / 16 + 1) / 4);
        let string = '';
        for (let y = 0; y === 0 || y * 16 < this.length; y++) {
            const row = this.sub(y * 16, (y + 1) * 16).to_array();
            string += y.toString(16).padStart(row_padding, '0') + 'h: ';
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
