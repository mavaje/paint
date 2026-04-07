
export function clamp(value: number, min: number = -Infinity, max: number = Infinity): number {
    return Math.min(Math.max(value, min), max);
}

export function mod(value: number, modulus: number): number {
    return value < 0
        ? (value % modulus) + modulus
        : value % modulus;
}
