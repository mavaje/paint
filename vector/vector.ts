export type Vector3<T = number> = [T, T, T] | [T, T, T, T];

export class Vector<N extends number> extends Array<number> {
    declare length: N;

    get x() { return this[0] ?? 0; }
    get y() { return this[1] ?? 0; }
    get z() { return this[2] ?? 0; }
    get w() { return this[3] ?? 0; }

    get xy(): Vector<2> { return vec2(this); }

    get xyz(): Vector<3> { return vec3(this); }

    get xyzw(): Vector<4> { return vec4(this); }
}

export function vec<N extends number>(n: N, vector: number[], fallback: number[] = []): Vector<N> {
    const values: number[] = [];
    for (let i = 0; i < n; i++) {
        values[i] = vector[i] ?? fallback[i] ?? 0;
    }
    return new Vector<N>(...values);
}

export function vec2(vector: number[]): Vector<2> {
    return vec(2, vector);
}

export function vec3(vector: number[]): Vector<3> {
    return vec(3, vector);
}

export function vec4(vector: number[]): Vector<4> {
    return vec(4, vector);
}
