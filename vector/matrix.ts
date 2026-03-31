import {vec, Vector} from "./vector";

export class Matrix<N extends number, M extends number> extends Array<Vector<N>> {
    declare length: M;

    get width(): N {
        return this[0]?.length;
    }

    get height(): M {
        return this.length;
    }

    multiply(vector: number[]): Vector<M>;
    multiply(matrix: number[][]): Matrix<number, M>;
    multiply(operand: number[] | number[][]): Vector<M> | Matrix<number, M> {
        if (Array.isArray(operand[0])) {
            const matrix = mat(operand.length, this.width, operand as number[][]);
            return mat(matrix.width, this.height, this.map(
                row => matrix[0].map(
                    (_, i) => row.reduce((sum, v, j) => sum + v * matrix[j][i], 0)
                )));
        } else {
            const vector = vec(this.width, operand as number[]);
            return vec(this.height, this.map(
                row => row.reduce((sum, v, i) => sum + v * vector[i], 0)
            ));
        }
    }
}

export function identity<N extends number, M extends number>(n: N, m: M): Matrix<N, M> {
    const rows: Vector<N>[] = [];
    for (let j = 0; j < m; j++) {
        const row: number[] = [];
        for (let i = 0; i < n; i++) {
            row[i] = i === j ? 1 : 0;
        }
        rows[j] = vec(n, row);
    }
    return new Matrix<N, M>(...rows);
}

export function mat<N extends number, M extends number>(n: N, m: M, matrix: number[][]): Matrix<N, M> {
    const rows: Vector<N>[] = [];
    const fallback: Matrix<N, M> = identity(n, m);
    for (let i = 0; i < m; i++) {
        rows[i] = vec(n, matrix[i] ?? [], fallback[i]);
    }
    return new Matrix<N, M>(...rows);
}

export function mat2x2(matrix: number[][]): Matrix<2, 2> {
    return mat(2, 2, matrix);
}

export function mat2x3(matrix: number[][]): Matrix<2, 3> {
    return mat(2, 3, matrix);
}

export function mat2x4(matrix: number[][]): Matrix<2, 4> {
    return mat(2, 4, matrix);
}

export function mat3x2(matrix: number[][]): Matrix<3, 2> {
    return mat(3, 2, matrix);
}

export function mat3x3(matrix: number[][]): Matrix<3, 3> {
    return mat(3, 3, matrix);
}

export function mat3x4(matrix: number[][]): Matrix<3, 4> {
    return mat(3, 4, matrix);
}

export function mat4x2(matrix: number[][]): Matrix<4, 2> {
    return mat(4, 2, matrix);
}

export function mat4x3(matrix: number[][]): Matrix<4, 3> {
    return mat(4, 3, matrix);
}

export function mat4x4(matrix: number[][]): Matrix<4, 4> {
    return mat(4, 4, matrix);
}
