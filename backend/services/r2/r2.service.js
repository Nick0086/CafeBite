import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, ListObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PassThrough } from 'stream';
import r2Client from '../../config/r2Config.js';

const bucketName = process.env.R2_BUCKET_NAME

//create function to list objects
export const listObjects = async (prefix) => {
    const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        Delimiter: '/'
    });
    const response = await r2Client.send(command);
    return response;
}

//create function to get object from s3
export const getObjectFromS3 = async (key) => {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
    });
    const response = await r2Client.send(command);
    return response;
}

export const uploadstreamToS3 = async (body, key, mimetype) => {
    try {
        const stream = new PassThrough();
        stream.push(body);
        stream.end();


        console.log(key?.folder)
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key?.folder,
            Body: stream,
            ContentLength: stream.readableLength,
            ContentType: mimetype || 'image/webp', // set content type if needed
            CacheControl: 'public, max-age=2592000', // optional for CDN caching
        });

        const response = await r2Client.send(command);
        return response;
    } catch (error) {
        console.log("uploadstreamToS3 error = ", error)
        throw error;
    }
}

export const getSignedUrlFromS3 = async (key, expiresIn) => {
    let commandOptions = {
        Bucket: bucketName,
        Key: key,
    };

    const command = new GetObjectCommand(commandOptions);

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: expiresIn });
    return signedUrl;
}

export const getUploadPresignedUrl = async (key, expiresIn = 3600) => {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
    });
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: expiresIn });
    return signedUrl;
}

export const deleteObjectFromS3 = async (key) => {
    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
    });
    const response = await r2Client.send(command);
    return response;
}
