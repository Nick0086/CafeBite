import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit'

import userRoutes from './routes/user.routes.js'
import authRoutes from './routes/auth.routes.js'
import commonRoutes from './routes/common.routes.js'
import categoriesRoutes from './routes/categories.routes.js'
import menuRoutes from './routes/menuItems.routes.js'
import templateRoutes from './routes/templates.routes.js'
import tablesQrcodeRoutes from './routes/tables-qrcode.routes.js'
import customerMenuRoutes from './routes/customer-menu.routes.js'

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 300 // limit each IP to 300 requests per windowMs
})

console.log("process.env.FRONTEND_DOMAIN",process.env.FRONTEND_DOMAIN) 
const app = express();
app.use(cors({
    origin: [process.env.FRONTEND_DOMAIN],
    credentials: true
}))

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(limiter)


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

//login api
app.use('/v1/client', userRoutes);

// auth api
app.use('/v1/auth', authRoutes);

//common api
app.use('/v1/common', commonRoutes)

//category api
app.use('/v1/category', categoriesRoutes)

//menu api
app.use('/v1/menu', menuRoutes)

//template api
app.use('/v1/template', templateRoutes)

//table api
app.use('/v1/tables', tablesQrcodeRoutes)

// menu viwer
app.use('/v1/customer-menu', customerMenuRoutes);

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, () => {
    console.log(`${new Date().toLocaleString()} - Server listening on port ${PORT}`);
});