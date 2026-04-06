
export class Vector<N extends number> extends Array<number> {
    declare length: N;
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
