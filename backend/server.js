import app from './app.js';
import { ensureBucketExists } from './src/config/minioConfig.js';

const PORT = process.env.PORT || 3002;

ensureBucketExists().catch(err => console.error('MinIO bucket init failed:', err));

const server = app.listen(PORT, () => {
    console.log(`${new Date().toLocaleString()} - Server listening on port ${PORT}`);
});
