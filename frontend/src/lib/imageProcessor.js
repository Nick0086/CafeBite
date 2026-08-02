export const processImageToWebp = async (file) => {
    const bitmap = await createImageBitmap(file);
    const maxWidth = 1200;
    const scale = bitmap.width > maxWidth ? maxWidth / bitmap.width : 1;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('WebP conversion failed')), 'image/webp', 0.8));
};
