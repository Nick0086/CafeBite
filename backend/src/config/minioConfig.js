import { S3Client, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';

const minioClient = new S3Client({
    region: 'us-east-1',
    endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY,
    },
});

export const ensureBucketExists = async () => {
    try {
        await minioClient.send(new HeadBucketCommand({ Bucket: process.env.MINIO_BUCKET_NAME }));
        console.log(`MinIO bucket '${process.env.MINIO_BUCKET_NAME}' exists`);
    } catch {
        console.log(`Creating MinIO bucket '${process.env.MINIO_BUCKET_NAME}'...`);
        await minioClient.send(new CreateBucketCommand({ Bucket: process.env.MINIO_BUCKET_NAME }));
        console.log(`MinIO bucket '${process.env.MINIO_BUCKET_NAME}' created`);
    }
};

export default minioClient;
