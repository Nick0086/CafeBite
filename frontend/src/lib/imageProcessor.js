export const processImageToWebp = async (file) => {
    const bitmap = await createImageBitmap(file);
    const maxWidth = 1200;
    const minRatio = 3 / 2;

    let sw = bitmap.width;
    let sh = bitmap.height;
    let sx = 0;
    let sy = 0;

    if (sw / sh < minRatio) {
        sh = Math.round(sw / minRatio);
        sy = 0;
    }

    let width = sw;
    let height = sh;
    if (width > maxWidth) {
        const scale = maxWidth / width;
        width = maxWidth;
        height = Math.round(sh * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
    bitmap.close();
    return new Promise((resolve, reject) =>
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('WebP conversion failed')), 'image/webp', 0.85),
    );
};
