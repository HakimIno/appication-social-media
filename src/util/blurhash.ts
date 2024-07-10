import { loadImage, createCanvas } from 'canvas'

function rgbToYuv(r: number, g: number, b: number) {
    let y = 0.299 * r + 0.587 * g + 0.114 * b;
    let u = -0.14713 * r - 0.28886 * g + 0.436 * b;
    let v = 0.615 * r - 0.51499 * g - 0.10001 * b;
    return [y, u, v];
}

function encodeDC(value: number[]) {
    return ((value[0] << 16) + (value[1] << 8) + value[2]).toString(36);
}

function encodeAC(value: number[], maximumValue: number) {
    let quantR = Math.floor(Math.max(0, Math.min(18, Math.floor(value[0] / maximumValue * 9 + 9.5))));
    let quantG = Math.floor(Math.max(0, Math.min(18, Math.floor(value[1] / maximumValue * 9 + 9.5))));
    let quantB = Math.floor(Math.max(0, Math.min(18, Math.floor(value[2] / maximumValue * 9 + 9.5))));
    return (quantR * 19 * 19 + quantG * 19 + quantB).toString(36);
}

export async function blurHashEncodeFromUrl(imageUrl: string, width: number, height: number, componentX: number, componentY: number) {
    const image = await loadImage(imageUrl);

    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    context.drawImage(image, 0, 0, width, height);
    const imageData = context.getImageData(0, 0, width, height).data;

    let factors = [];

    for (let y = 0; y < componentY; y++) {
        for (let x = 0; x < componentX; x++) {
            let normalisation = (x == 0 && y == 0) ? 1 : 2;
            let r = 0, g = 0, b = 0;

            for (let j = 0; j < height; j++) {
                for (let i = 0; i < width; i++) {
                    let basis = Math.cos(Math.PI * x * i / width) * Math.cos(Math.PI * y * j / height);
                    r += basis * imageData[(j * width + i) * 4 + 0];
                    g += basis * imageData[(j * width + i) * 4 + 1];
                    b += basis * imageData[(j * width + i) * 4 + 2];
                }
            }

            let scale = normalisation / (width * height);
            factors.push([r * scale, g * scale, b * scale]);
        }
    }

    let hash = [];
    let sizeFlag = (componentX - 1) + (componentY - 1) * 9;
    hash.push(sizeFlag.toString(36));

    let maximumValue;
    if (factors.length > 1) {
        let actualMaximumValue = Math.max(...factors.slice(1).map(factor => Math.max(...factor.map(Math.abs))));
        let quantisedMaximumValue = Math.floor(Math.max(0, Math.min(82, Math.floor(actualMaximumValue * 166 - 0.5))));
        maximumValue = (quantisedMaximumValue + 1) / 166;
        hash.push(quantisedMaximumValue.toString(36));
    } else {
        maximumValue = 1;
        hash.push('0');
    }

    hash.push(encodeDC(factors[0].map(Math.round)));

    for (let i = 1; i < factors.length; i++) {
        hash.push(encodeAC(factors[i], maximumValue));
    }

    return hash.join('');
}