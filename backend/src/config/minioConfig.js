import { S3Client, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';

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
    const bucket = process.env.MINIO_BUCKET_NAME || 'cafebite';
    try {
        await minioClient.send(new HeadBucketCommand({ Bucket: bucket }));
        console.log(`MinIO bucket '${bucket}' exists`);
    } catch {
        console.log(`Creating MinIO bucket '${bucket}'...`);
        await minioClient.send(new CreateBucketCommand({ Bucket: bucket }));
        console.log(`MinIO bucket '${bucket}' created`);
    }

    try {
        const policy = JSON.stringify({
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Allow',
                    Principal: '*',
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${bucket}/*`],
                },
            ],
        });
        await minioClient.send(new PutBucketPolicyCommand({ Bucket: bucket, Policy: policy }));
        console.log(`Public read policy applied to MinIO bucket '${bucket}'`);
    } catch (err) {
        console.warn('Could not set MinIO bucket public policy:', err.message);
    }
};

export default minioClient;
