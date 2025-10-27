import { Jimp } from 'jimp';
import jsQR from 'jsqr';

export async function readQR(file) {
    const image = await Jimp.read(await file.arrayBuffer());
    const { data, width, height } = image.bitmap;

    const code = jsQR(new Uint8ClampedArray(data), width, height);

    if (!code) throw new Error('No QR code found');

    try {
        return JSON.parse(code.data);
    } catch {
        return code.data;
    }
}
