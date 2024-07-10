import { encode } from 'blurhash';

export async function generateBlurHash(imageUrl: string, componentX: number, componentY: number) {
    // Load image data (you may need to handle CORS if loading from external domains)
    const image = new Image();
    image.crossOrigin = 'Anonymous'; // Handle CORS if necessary
    image.src = imageUrl;

    // Wait for image to load
    await new Promise((resolve) => {
        image.onload = resolve;
    });

    // Get dimensions of the image
    const width = image.width;
    const height = image.height;

    // Create a canvas element to get image data
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    // Check if getContext returned null
    if (!ctx) {
        throw new Error('Unable to get 2d context from canvas');
    }

    ctx.drawImage(image, 0, 0, width, height);

    // Get image data from canvas
    const imageData = ctx.getImageData(0, 0, width, height);

    // Generate BlurHash string
    const blurHash = encode(imageData.data, width, height, componentX, componentY);

    return blurHash;
}

