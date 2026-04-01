import {PNGFactory} from "./png/png-factory";
import {GraphicFactory} from "./graphic/graphic-factory";

const file_input = document.getElementById('file-input') as HTMLInputElement;
const file_output = document.getElementById('file-output') as HTMLAnchorElement;

file_input.addEventListener('input', async () => {
    const file = file_input.files?.[0];

    if (file) {
        console.log(file.type);

        const graphic_factory = new GraphicFactory();
        const graphic = await graphic_factory.from_file(file);
        console.log(graphic);
        document.body.append(graphic.layers[0].canvas);

        const png_factory = new PNGFactory();
        const png = png_factory.from_graphic(graphic);

        console.log(png);
        console.log(png.bytes().toString());

        const blob = new Blob([png.bytes()]);
        file_output.href = URL.createObjectURL(blob);
        file_output.download = file.name.replace(/(\.png)?$/, '.png');

        const png2 = png_factory.from_data(await file.bytes());
        console.log(png2);
        console.log(png2.bytes().toString());
    }
});
