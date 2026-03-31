import {RGB} from "./rgb";
import {Color, ColorSpace} from "./color";

const SHOW_PASSED = false;
const SHOW_FAILED = true;

let assertion_count = 0;
let pass_count = 0;
let fail_count = 0;

function assert(condition: any, message: string = ''): boolean {
    assertion_count++;
    if (condition) {
        pass_count++;
        if (SHOW_PASSED) {
            console.log(`✅ PASS ${message}`);
        }
        return true;
    } else {
        fail_count++;
        if (SHOW_FAILED) {
            console.error(`❌ FAIL ${message}`);
        }
        return false;
    }
}

function assert_equal(value_1: any, value_2: any, message: string = ''): boolean {
    return assert(
        value_1 === value_2,
        `${value_1} = ${value_2} ${message}`,
    );
}

function assert_colors_equal(color_1: Color, color_2: Color, message?: string): boolean {
    return [
        assert_equal(color_1.toString(), color_2.in_space(color_1.space).toString(), message),
        assert_equal(color_2.toString(), color_1.in_space(color_2.space).toString(), message),
    ].every(Boolean);
}

function random_rgb() {
    return RGB.from([
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
    ]);
}

export function run_tests() {
    const spaces: ColorSpace[] = [
        'cielab',
        'ciexyz',
        'hsl',
        'hsv',
        'lms',
        'oklab',
        'oklch',
        'rgb',
    ];

    const trials = 100;

    const results: {
        [X in ColorSpace]?: {
            [Y in ColorSpace]?: string;
        }
    } = {};

    for (const space_1 of spaces) {
        results[space_1] = {};
        for (const space_2 of spaces) {
            let passes = 0;

            for (let i = 0; i < trials; i++) {
                const color = random_rgb();

                const in_space_1 = color.in_space(space_1);
                const in_space_2 = color.in_space(space_2);

                const pass = assert_colors_equal(in_space_1, in_space_2, `Comparing ${space_1} and ${space_2}`);

                if (pass) passes++;
            }

            if (passes === trials) {
                results[space_1][space_2] = `√ 100.00%`;
            } else if (passes > 0) {
                results[space_1][space_2] = `⚠ ${(100 * passes / trials).toFixed(2).padStart(6)}%`;
            } else {
                results[space_1][space_2] = `✕   0.00%`;
            }
        }
    }

    console.table(results);

    console.log(`${fail_count > 0 ? '❌' : '✅'} PASSED ${pass_count} / ${assertion_count} (${(pass_count / assertion_count * 100).toFixed(2)}%)`)
}

run_tests();
