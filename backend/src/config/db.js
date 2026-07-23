//db.js'
import mysql from 'mysql2';

// create the connection to database
const pool = mysql.createPool({
    port: process.env.NODE_ENV === 'production' ? process.env.DB_PORT_PROD : process.env.DB_PORT,
    host: process.env.NODE_ENV === 'production' ? process.env.DB_HOST_PROD : process.env.DB_HOST,
    user: process.env.NODE_ENV === 'production' ? process.env.DB_USER_PROD : process.env.DB_USER,
    password: process.env.NODE_ENV === 'production' ? process.env.DB_PASSWORD_PROD : process.env.DB_PASSWORD,
    database: process.env.NODE_ENV === 'production' ? process.env.DB_NAME_PROD : process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    supportBigNumbers: true,
    bigNumberStrings: true,
});

const promisePool = pool.promise();

export default promisePool;