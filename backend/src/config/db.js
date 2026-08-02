//db.js'
import mysql from 'mysql2';

const isProd = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'PROD';

// create the connection to database
const pool = mysql.createPool({
    port: isProd ? process.env.DB_PORT_PROD : process.env.DB_PORT,
    host: isProd ? process.env.DB_HOST_PROD : process.env.DB_HOST,
    user: isProd ? process.env.DB_USER_PROD : process.env.DB_USER,
    password: isProd ? process.env.DB_PASSWORD_PROD : process.env.DB_PASSWORD,
    database: isProd ? process.env.DB_NAME_PROD : process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    supportBigNumbers: true,
    bigNumberStrings: true,
});

const promisePool = pool.promise();

export default promisePool;