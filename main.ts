import {PNG} from "./png/png";

const file_input = document.getElementById('file-input') as HTMLInputElement;
const file_output = document.getElementById('file-output') as HTMLAnchorElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

file_input.addEventListener('input', async () => {
    const file = file_input.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.addEventListener('load', () => {
            const image = new Image();
            image.src = reader.result as string;
            image.addEventListener('load', () => {
                canvas.width = image.width;
                canvas.height = image.height;
                const context = canvas.getContext('2d');
                if (context) {
                    context.drawImage(image, 0, 0);
                    let data: ImageData;
                    data = context.getImageData(0, 0, canvas.width, canvas.height, {
                        colorSpace: 'srgb',
                        // @ts-ignore
                        pixelFormat: 'rgba-unorm8',
                    });
                    console.log(data);
                    data = context.getImageData(0, 0, canvas.width, canvas.height, {
                        colorSpace: 'display-p3',
                        // @ts-ignore
                        pixelFormat: 'rgba-unorm8',
                    });
                    console.log(data);
                    data = context.getImageData(0, 0, canvas.width, canvas.height, {
                        colorSpace: 'srgb',
                        // @ts-ignore
                        pixelFormat: 'rgba-float16',
                    });
                    console.log(data);
                    data = context.getImageData(0, 0, canvas.width, canvas.height, {
                        colorSpace: 'display-p3',
                        // @ts-ignore
                        pixelFormat: 'rgba-float16',
                    });
                    console.log(data);
                }
            });
        });

        const bytes = await file.bytes();
        const png = PNG.from_bytes(bytes);

        console.log(png);

        const blob = new Blob([png.bytes()]);
        file_output.href = URL.createObjectURL(blob);
        file_output.download = file.name;
    }
});
