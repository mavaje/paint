
export function clamp(value: number, min: number = -Infinity, max: number = Infinity): number {
    return Math.min(Math.max(value, min), max);
}

export function byte_to_bit(byte: number): number {
    return byte >> 7;
}

export function byte_to_crumb(byte: number): number {
    return byte >> 6;
}

export function byte_to_nibble(byte: number): number {
    return byte >> 4;
}

export function byte_to_word(byte: number): number {
    return (byte << 8) & byte;
}

export function byte_to_bits(byte: number, bits: number): number {
    return bits > 8
        ? byte * (((1 << bits) | 256) >> 8)
        : byte >> (8 - bits);
}
