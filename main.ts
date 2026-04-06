import {PNGFactory} from "./png/png-factory";
import {PaintingFactory} from "./painting/painting-factory";
// import {Palette} from "./painting/palette";
// import { RGB } from "./color/rgb";

const file_input = document.getElementById('file-input') as HTMLInputElement;
const file_output = document.getElementById('file-output') as HTMLAnchorElement;

file_input.addEventListener('input', async () => {
    const file = file_input.files?.[0];

    if (file) {
        console.log(file.type);

        const painting_factory = new PaintingFactory();
        const painting = await painting_factory.from_file(file);
        console.log(painting);
        document.body.append(painting.layers[0].canvas);

        // painting.is_greyscale = true;
        // painting.has_transparency = false;
        // painting.color_depth = 16;

        // painting.palette = new Palette([
        //     RGB.from_hex('#000000'),
        //     RGB.from_hex('#ffffff'),
        //     RGB.from_hex('#ff0000'),
        //     RGB.from_hex('#00ff00'),
        //     RGB.from_hex('#0000ff'),
        //     RGB.from_hex('#ffff00'),
        //     RGB.from_hex('#ff00ff'),
        //     RGB.from_hex('#00ffff'),
        // ]);

        const png_factory = new PNGFactory();
        const png = png_factory.from_painting(painting);

        console.log(png);
        console.log(png.bytes().toString());

        const blob = new Blob([png.bytes()]);
        file_output.href = URL.createObjectURL(blob);
        file_output.download = file.name.replace(/(\.png)?$/, '.png');

        // const png2 = png_factory.from_data(await file.bytes());
        // console.log(png2);
        // console.log(png2.bytes().toString());
    }
});
