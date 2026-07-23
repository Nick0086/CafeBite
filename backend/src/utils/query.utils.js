import promisePool from '../config/db.js';

const query = async (sql, values, connection = null, retries = 3) => {
    try {
        const pool = connection || promisePool;
        const [rows, fields] = await pool.query(sql, values);
        return rows;
    } catch (error) {
        if (error.code === 'ECONNRESET' && retries > 0) {
            console.log("Reconnecting to the database. Attempts remaining:", retries);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return query(sql, values, connection, retries - 1);
        }
        throw error;
    }
}

export const withTransaction = async (callback) => {
    const connection = await promisePool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export default query;
