import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as presignUrl } from '@aws-sdk/s3-request-presigner';
import minioClient from '../../config/minioConfig.js';

const bucketName = process.env.MINIO_BUCKET_NAME;

const formatPublicUrl = (url) => {
    if (!url) return url;
    const isProd = process.env.NODE_ENV === 'PROD' || process.env.NODE_ENV === 'production';
    const defaultHost = isProd ? 'api.smartmenu.company/storage' : `${process.env.MINIO_ENDPOINT || '127.0.0.1'}:${process.env.MINIO_PORT || 9000}`;
    const publicHost = process.env.MINIO_PUBLIC_HOST || defaultHost;
    const protocol = isProd || process.env.MINIO_USE_HTTPS === 'true' ? 'https' : 'http';

    return url
        .replace(/https?:\/\/(127\.0\.0\.1|localhost|162\.35\.183\.41):9000/g, `${protocol}://${publicHost}`)
        .replace(/^http:\/\//i, `${protocol}://`);
};

export const uploadObject = async (body, key, mimetype) => {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: mimetype || 'image/webp',
        CacheControl: 'public, max-age=2592000',
    });
    return minioClient.send(command);
};

export const getSignedUrl = async (key, expiresIn = 86400) => {
    if (!key) return null;
    const isProd = process.env.NODE_ENV === 'PROD' || process.env.NODE_ENV === 'production';
    const protocol = isProd || process.env.MINIO_USE_HTTPS === 'true' ? 'https' : 'http';
    const defaultHost = isProd ? 'api.smartmenu.company/storage' : `${process.env.MINIO_ENDPOINT || '127.0.0.1'}:${process.env.MINIO_PORT || 9000}`;
    const publicHost = process.env.MINIO_PUBLIC_HOST || defaultHost;

    // Clean public URL using bucket policy - no signature needed
    return `${protocol}://${publicHost}/${bucketName}/${key}`;
};

export const getUploadSignedUrl = async (key, expiresIn = 300) => {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: 'image/webp',
    });
    const url = await presignUrl(minioClient, command, { expiresIn });
    return formatPublicUrl(url);
};

export const deleteObject = async (key) => {
    const command = new DeleteObjectCommand({ Bucket: bucketName, Key: key });
    return minioClient.send(command);
};
