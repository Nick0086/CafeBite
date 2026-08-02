export const prepareCoverForEditor = async (file) => {
    const bitmap = await createImageBitmap(file);
    const targetRatio = 16 / 9;
    const sw = bitmap.width;
    const sh = bitmap.height;
    const sourceRatio = sw / sh;

    let cropW;
    let cropH;
    let cropX;
    let cropY;

    if (sourceRatio > targetRatio) {
        cropH = sh;
        cropW = Math.round(sh * targetRatio);
        cropX = Math.round((sw - cropW) / 2);
        cropY = 0;
    } else {
        cropW = sw;
        cropH = Math.round(sw / targetRatio);
        cropX = 0;
        cropY = Math.round((sh - cropH) / 2);
    }

    const canvas = document.createElement('canvas');
    canvas.width = cropW;
    canvas.height = cropH;
    canvas.getContext('2d').drawImage(bitmap, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    bitmap.close();

    return await new Promise((resolve, reject) =>
        canvas.toBlob(
            (blob) => blob
                ? resolve(new File([blob], file.name.replace(/\.[^.]+$/, '') + '.png', { type: 'image/png' }))
                : reject(new Error('Failed to prepare image')),
            'image/png',
            1
        )
    );
};

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
