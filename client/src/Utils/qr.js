import QRCodeReader from 'qrcode-reader';
import { Jimp } from 'jimp';

export async function readQR(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const image = await Jimp.read(event.target.result);
                const qr = new QRCodeReader();

                qr.callback = (err, value) => {
                    if (err) return reject(err);
                    try {
                        const parsed = JSON.parse(value.result);
                        resolve(parsed);
                    } catch {
                        resolve(value.result);
                    }
                };

                qr.decode(image.bitmap);
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
}
