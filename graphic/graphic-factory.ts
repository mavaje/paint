import {event} from "../promises";
import {Painting} from "./painting";

export class GraphicFactory {

    async from_file(file: File): Promise<Painting> {
        if (file.type === 'image/png' && false) {
            // const data = await file.bytes();
            // return this.from_data(data);
        } else if (file.type.startsWith('image/')) {
            try {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                await event(reader, 'load', ['abort', 'error']);

                const image = new Image();
                image.src = reader.result as string;
                await event(image, 'load', ['abort', 'error']);

                const graphic = new Painting(image.width, image.height);
                graphic.layers[0].context.drawImage(image, 0, 0);
                return graphic;
            } catch (error) {
                throw new Error('File seems corrupted!');
            }
        } else {
            throw new Error('Invalid file type!');
        }
    }
}
