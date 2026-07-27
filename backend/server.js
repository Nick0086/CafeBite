import app from './app.js';
import db from './src/config/db.js';
import { ensureBucketExists } from './src/config/minioConfig.js';

const PORT = process.env.PORT || 3002;
const ts = () => new Date().toLocaleString();

console.log(`[${ts()}] Starting CafeBite backend...`);

db.getConnection()
    .then(() => console.log(`[${ts()}] Database connected`))
    .catch(err => { console.error(`[${ts()}] Database connection failed:`, err.message); process.exit(1); });

ensureBucketExists()
    .then(() => console.log(`[${ts()}] MinIO ready`))
    .catch(err => console.error(`[${ts()}] MinIO bucket init failed:`, err.message));

const server = app.listen(PORT, () => {
    console.log(`[${ts()}] Server listening on port ${PORT}`);
});
