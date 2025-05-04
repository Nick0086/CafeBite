import query from "./query.utils";

const executeWithRetry = async (sql, params, maxRetries = 3) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const result = await query(sql, params);
            if (result.affectedRows === 1) {
                return result;
            }
            console.warn(`Attempt ${attempt + 1}: No rows affected for query: ${sql}`);
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed: ${error.message}`);
            if (attempt === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
        }
    }
    throw new Error(`Failed to affect rows after ${maxRetries} attempts`);
}

export default executeWithRetry