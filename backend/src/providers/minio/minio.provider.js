import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as presignUrl } from '@aws-sdk/s3-request-presigner';
import minioClient from '../../config/minioConfig.js';

const bucketName = process.env.MINIO_BUCKET_NAME;

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
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
    return presignUrl(minioClient, command, { expiresIn });
};

export const deleteObject = async (key) => {
    const command = new DeleteObjectCommand({ Bucket: bucketName, Key: key });
    return minioClient.send(command);
};
