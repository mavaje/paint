const reset_codes = {
    reset: 0,
};

const italic_codes = {
    italic: 3,
    not_italic: 23,
};

const underline_codes = {
    underline: 4,
    no_underline: 24,
};

const blink_codes = {
    blink: 5,
    blink_rapid: 6,
    no_blink: 25,
};

const weight_codes = {
    faint: 2,
    normal: 22,
    bold: 1,
};

const normal_color_codes = {
    black: 30,
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    magenta: 35,
    cyan: 36,
    white: 37,
};

const bright_color_codes = Object.fromEntries(Object.entries(normal_color_codes).map(([key, value]) => [`bright_${key}`, value + 60]));

const color_alias_codes = {
    gray: bright_color_codes['bright_black'],
    grey: bright_color_codes['bright_black'],
};

const background_codes = Object.fromEntries(Object.entries({
    ...normal_color_codes,
    ...bright_color_codes,
    ...color_alias_codes,
}).map(([key, value]) => [`bg_${key}`, value + 10]));

type Reset = keyof typeof reset_codes;
type Italic = keyof typeof italic_codes;
type Underline = keyof typeof underline_codes;
type Blink = keyof typeof blink_codes;
type Weight = keyof typeof weight_codes;
type NormalColor = keyof typeof normal_color_codes;
type BrightColor = `bright_${NormalColor}`;
type NamedColor = NormalColor | BrightColor | keyof typeof color_alias_codes;
type Color = NamedColor | 'fg' | 'rgb' | 'hex';
type NamedBackground = `bg_${NamedColor}`;
type Background = NamedBackground | 'bg' | 'bg_rgb' | 'bg_hex';

type FontSet<KS extends string, O extends string = never> = {
    [K in Exclude<KS, O>]: FansiFont<O | KS>;
};

interface ColorFunction<O extends string = never> {
    (n: number): FansiFont<O>;
    (r: number, g: number, b: number): FansiFont<O>;
    (hex: string): FansiFont<O>;
}

type RGBFunction<O extends string = never> = (r: number, g: number, b: number) => FansiFont<O>;
type HexFunction<O extends string = never> = (hex: string) => FansiFont<O>;

type FontColor<O extends string = never> = {
    [K in Exclude<NamedColor, O>]: FansiFont<O | Color>;
} & Omit<{
    fg: ColorFunction<O | Color>;
    rgb: RGBFunction<O | Color>;
    hex: HexFunction<O | Color>;
}, O>;

type FontBackground<O extends string = never> = {
    [K in Exclude<NamedBackground, O>]: FansiFont<O | Background>;
} & Omit<{
    bg: ColorFunction<O | Background>;
    bg_rgb: RGBFunction<O | Background>;
    bg_hex: HexFunction<O | Background>;
}, O>;

type FansiFont<O extends string = never> =
    FontSet<Reset, O> &
    FontSet<Italic, O> &
    FontSet<Underline, O> &
    FontSet<Blink, O> &
    FontSet<Weight, O> &
    FontColor<O> &
    FontBackground<O> &
    ((text: string | TemplateStringsArray, ...args: any[]) => string);

function escape(...codes: number[]) {
    return codes.length > 0 ? `\x1b[${codes.map(Math.floor).join(';')}m` : '';
}

function hex_to_rgb(hex: string): [number, number, number] {
    hex = String(hex).replace(/[^0-9a-f]/i, '');
    if (hex.length < 6) hex = hex.replace(/./g, '$&$&');
    return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

function make_fansi(...codes: number[]): FansiFont {
    const escape_code = escape(...codes);

    const fansi = function(text: string | TemplateStringsArray, ...args: any[]) {
        if (Array.isArray(text)) {
            text = text.reduce((string, part, i) => string + part + (args[i] ?? ''), '');
        }
        text = String(text).replace(/\x1b\[((\d+;)*)0((;\d+)*)m/g, escape_code);
        return `${escape_code}${text}${escape(reset_codes.reset)}`;
    } as FansiFont;

    fansi.toString = () => escape_code;

    Object.entries(reset_codes).forEach(([key, value]) => {
        Object.defineProperty(fansi, key, {
            get: () => make_fansi(value, ...codes),
        });
    });

    Object.entries({
        ...italic_codes,
        ...underline_codes,
        ...blink_codes,
        ...weight_codes,
        ...normal_color_codes,
        ...bright_color_codes,
        ...background_codes,
        ...color_alias_codes,
    }).forEach(([key, value]) => {
        Object.defineProperty(fansi, key, {
            get: () => make_fansi(...codes, value),
        });
    });

    Object.entries({
        fg: 38,
        bg: 48,
    }).forEach(([key, code]) => {
        (fansi as any)[key] = (...args: [number] | [string] | [number, number, number] | [[number, number, number]]) => {
            if (Array.isArray(args[0])) args = args[0];
            if (args.length >= 3) {
                return make_fansi(...codes, code, 2, ...args.slice(0, 3) as [number, number, number]);
            } else if (typeof args[0] === 'string') {
                return make_fansi(...codes, code, 2, ...hex_to_rgb(args[0] as string));
            } else {
                return make_fansi(...codes, code, 5, args[0] as number);
            }
        };
    });

    Object.entries({
        rgb: 38,
        bg_rgb: 48,
    }).forEach(([key, code]) => {
        (fansi as any)[key] = (...args: [number, number, number] | [[number, number, number]]) => {
            if (Array.isArray(args[0])) args = args[0];
            return make_fansi(...codes, code, 2, ...args.slice(0, 3) as [number, number, number]);
        }
    });

    Object.entries({
        hex: 38,
        bg_hex: 48,
    }).forEach(([key, code]) => {
        (fansi as any)[key] = (hex: string) => make_fansi(...codes, code, 2, ...hex_to_rgb(hex));
    });

    return fansi;
}

export const fansi = make_fansi();
export const f = fansi;

export const {
    reset,
    italic,
    not_italic,
    underline,
    no_underline,
    blink,
    blink_rapid,
    no_blink,
    faint,
    normal,
    bold,
    black,
    red,
    green,
    yellow,
    blue,
    magenta,
    cyan,
    white,
    bright_black,
    bright_red,
    bright_green,
    bright_yellow,
    bright_blue,
    bright_magenta,
    bright_cyan,
    bright_white,
    gray,
    grey,
    bg_black,
    bg_red,
    bg_green,
    bg_yellow,
    bg_blue,
    bg_magenta,
    bg_cyan,
    bg_white,
    bg_bright_black,
    bg_bright_red,
    bg_bright_green,
    bg_bright_yellow,
    bg_bright_blue,
    bg_bright_magenta,
    bg_bright_cyan,
    bg_bright_white,
    bg_gray,
    bg_grey,
    fg,
    rgb,
    hex,
    bg,
    bg_rgb,
    bg_hex,
} = fansi;
