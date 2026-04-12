// import {PNGFactory} from "./png/png-factory";
import {PaintingFactory} from "./painting/painting-factory";
// import {stopwatch} from "./stopwatch";
// import {Palette} from "./painting/palette";
// import { RGB } from "./color/rgb";

const file_input = document.getElementById('file-input') as HTMLInputElement;
// const file_output = document.getElementById('file-output') as HTMLAnchorElement;

file_input.addEventListener('input', async () => {
    const file = file_input.files?.[0];

    if (file) {
        const painting_factory = new PaintingFactory();
        const painting = await painting_factory.from_file(file);

        // painting.set_palette(new Palette([
        //     RGB.from_hex('#000000'),
        //     RGB.from_hex('#0000ff'),
        //     RGB.from_hex('#00ff00'),
        //     RGB.from_hex('#00ffff'),
        //     RGB.from_hex('#ff0000'),
        //     RGB.from_hex('#ff00ff'),
        //     RGB.from_hex('#ffff00'),
        //     RGB.from_hex('#ffffff'),
        // ]), true);

        console.log(painting);
        document.body.append(painting.layers[0].canvas);

        // const png_factory = new PNGFactory();
        // png_factory.from_painting(painting);

        // console.log(png);

        // stopwatch.start('Creating download URL');
        //
        // const blob = new Blob([png.bytes()]);
        // file_output.href = URL.createObjectURL(blob);
        // file_output.download = file.name.replace(/(\.png)?$/, '.png');
        //
        // stopwatch.lap('URL created');

        // const png2 = png_factory.from_data(await file.bytes());
        // console.log(png2);
        // console.log(png2.bytes().toString());
    }
});
