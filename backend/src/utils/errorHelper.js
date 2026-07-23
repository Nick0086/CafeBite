import moment from 'moment-timezone';

export class HttpError extends Error {
    constructor(message, statusCode = 500, code = 'SERVER_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'HttpError';
    }
}

export const handleError = (sourceFile, fnName, res, error) => {
    const time = moment().tz('Asia/Kolkata').set({ second: 0 }).format('YYYY-MM-DD HH:mm:ss');
    console.log(`${time} :: Error in ${sourceFile} in function ${fnName}: `, error);
    const status = error.statusCode || 500;
    const code = error.code || 'SERVER_ERROR';
    return res.status(status).json({
        success: false,
        code,
        message: error.message || 'Internal server error'
    });
};
