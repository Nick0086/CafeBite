import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import moment from 'moment-timezone';
import apiRoutes from './src/routes/index.js';

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 300
});

const app = express();

app.use(cors({
    origin: [process.env.FRONTEND_DOMAIN],
    credentials: true
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use('/v1', apiRoutes);

app.use((err, req, res, next) => {
    const time = moment().tz('Asia/Kolkata').set({ second: 0 }).format('YYYY-MM-DD HH:mm:ss');
    console.log(`${time} :: Error in ${req.originalUrl}: `, err);
    const status = err.statusCode || 500;
    const code = err.code || 'SERVER_ERROR';
    res.status(status).json({
        success: false,
        code,
        message: err.message || 'Internal server error'
    });
});

export default app;
