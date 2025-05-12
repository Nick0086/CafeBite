import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { handleError } from "../utils/utils.js";
import { sendOtpEmail } from "../services/nodemailer/nodemailer.service.js";
import { sendSMS } from "../services/twilio/twilio.service.js";
import authService from "../services/auth.service.js";
import authRepository from '../repositories/auth.repositories.js';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,               // Required for cross-site cookies
    sameSite: 'none',           // Required for cross-site cookies
    path: '/',                  
};


// Checks if a user exists based on email or mobile number
export const checkUserExists = async (req, res) => {
    try {
        const { loginId } = req.body;
        const result = await authService.checkUserExists(loginId);

        if (result?.length === 0) {
            return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User account not found. Please verify the provided email or mobile number.' });
        }

        return res.status(200).json({ code: 'USER_FOUND', message: 'User account exists.' });

    } catch (error) {
        console.log("Error in checkUserExists: ", error);
        return res.status(500).json({ code: 'SERVER_ERROR', message: 'An unexpected error occurred while checking user existence.', error: error.message });
    }
}

// Verifies the user's password and creates a session if valid
export const verifyUserPassword = async (req, res) => {
    try {
        const { loginId, loginType, password } = req.body;

        if (!loginId || !loginType || !password) {
            return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Login identifier, method, and password are required.' });
        }

        const result = await authService.getUserByLoginId(loginId);

        if (result?.length === 0) {
            return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User account not found.' });
        }

        const hashedPassword = result[0].password;
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);


        if (!isPasswordValid) {
            return res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'The password you entered is incorrect.' });
        }

        const sessionId = await createUserSession(req, res,{ ...result[0], loginId, loginType })

        // Check if session creation failed
        if (!sessionId) {
            return res.status(500).json({ code: 'SESSION_CREATION_FAILED', message: 'Unable to create a user session at this time.' });
        }

        return res.status(200).json({ code: 'AUTH_SUCCESS', message: 'Password verified and session created successfully.', userData: result[0] });
    }
    catch (error) {
        console.error('Error in verifyUserPassword:', error);
        return res.status(500).json({ code: 'SERVER_ERROR', message: 'An unexpected error occurred during password verification.', error: error.message });
    }
}

// Sends a one-time password (OTP) to the user's email or mobile
export const sendOneTimePassword = async (req, res) => {
    try {
        const { loginId: identifier, loginType: method } = req.body;

        if (!identifier || !method) {
            return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Both login identifier and login method are required.' });
        }

        const result = await authService.getUserByLoginId(identifier);

        if (result?.length === 0) {
            return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User account not found.' });
        }

        const otp = generateOtp();
        const otpSessionId = uuidv4();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

        // Store OTP in the database
        const otpInsertResult = await authService.storeOtp(otpSessionId, otp, expiresAt, method, identifier);

        if (otpInsertResult.affectedRows === 0) {
            return res.status(500).json({ code: 'OTP_STORE_FAILED', message: 'Failed to store the OTP. Please try again later.' });
        }

        const message = `${otp} is your verification code. It will expire in 5 minutes.`;
        let sendResponse = false;

        if (method === 'EMAIL') {
            sendResponse = await sendOtpEmail({ toEmail: identifier, otp });
        } else {
            sendResponse = await sendSMS({ to: identifier, body: message });
        }

        if (!sendResponse) {
            return res.status(500).json({ code: 'OTP_SEND_FAILED', message: 'Failed to send the OTP. Please try again later.' });
        }

        res.cookie('otp_session_id', otpSessionId, {
            ...COOKIE_OPTIONS,
            maxAge: 5 * 60 * 1000,
        });

        return res.status(200).json({ code: 'OTP_SENT', message: 'One-time password sent successfully.' });
    } catch (error) {
        handleError('auth.controller.js', 'sendOneTimePassword', res, error, 'An unexpected error occurred while sending the OTP.');
    }
};

// Verifies the provided OTP and creates a session if valid
export const verifyOneTimePassword = async (req, res) => {
    try {
        const { OTP } = req.body;
        const otpSessionId = req.cookies?.otp_session_id;

        if (!otpSessionId || !OTP) {
            return res.status(400).json({ code: 'INVALID_REQUEST', message: 'OTP and session identifier are required.' });
        }

        const otpResults = await authService.verifyOtp(otpSessionId, OTP);

        if (otpResults?.length === 0) {
            return res.status(401).json({ code: 'INVALID_OTP', message: 'The provided OTP is invalid or has expired.' });
        }

        // Fetch user details
        const userResults = await authService.getUserByLoginId(otpResults[0].login_id);


        if (userResults?.length === 0) {
            return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'User account not found.' });
        }

        // Create session and tokens for OTP-based login
        const sessionId = await createUserSession(req, res, { ...userResults[0], loginId: otpResults[0].login_id, loginType: otpResults[0].login_type });

        // Check if session creation failed
        if (!sessionId) {
            return res.status(500).json({ code: 'SESSION_CREATION_FAILED', message: 'Failed to create a user session.', });
        }

        res.clearCookie('otp_session_id');

        return res.status(200).json({
            code: 'OTP_VERIFIED',
            message: 'OTP verified and session created successfully.',
            sessionId,
            userData: userResults[0],
        });
    } catch (error) {
        handleError("auth.controller.js", 'verifyOneTimePassword', res, error, 'An unexpected error occurred during OTP verification.');
    }
}

// Creates a new user session, issues JWT tokens, and sets them as cookies
const createUserSession = async (req, res, userData) => {
    try {
        const sessionId = uuidv4();
        const userAgent = req?.headers?.['user-agent'] || 'Unknown';
        const ipAddress = req?.ip || 'Unknown';
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        const { unique_id, loginId, loginType } = userData;

        const refreshToken = jwt.sign(
            { userDetails: { ...userData, password: null }, type: 'refresh' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        );

        const accessToken = jwt.sign(
            { userDetails: { ...userData, password: null }, type: 'access' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        const revokeResult = await authService.revokeSessions(unique_id, userAgent);
        const sessionResult = await authService.createSession(sessionId, unique_id, userAgent, loginId, loginType, ipAddress, expiresAt, refreshToken)

        if (sessionResult.affectedRows === 0) {
            return null;
        }

        res.cookie('accessToken', accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            // maxAge: 1000 * 60, // 1 day
        });

        res.cookie('refreshToken', refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        });

        return sessionId;
    } catch (error) {
        console.log('Error in createUserSession', error)
        return null;
    }
};

// Initiates a password reset request by generating a reset token and sending a reset email
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Email is required for password reset.' });
        }

        const success = await authService.requestPasswordReset(email);

        if (!success) {
            return res.status(404).json({ code: 'USER_NOT_FOUND', message: 'No user account found with the provided email address.' });
        }

        return res.status(200).json({ code: 'RESET_EMAIL_SENT', message: 'A password reset link has been sent to your email address.' });
    } catch (error) {
        handleError("auth.controller.js", 'requestPasswordReset', res, error, 'An error occurred while processing the password reset request.');
    }
};

// Resets the user password using a valid reset token
export const performPasswordReset = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ code: 'INVALID_REQUEST', message: 'Both reset token and new password are required.' });
        }

        const success = await authService.performPasswordReset(token, newPassword);

        if (!success) {
            return res.status(401).json({ code: 'INVALID_TOKEN', message: 'The password reset token is invalid or has expired.' });
        }

        return res.status(200).json({ code: 'PASSWORD_RESET_SUCCESS', message: 'Your password has been reset successfully.' });

    } catch (error) {
        handleError("auth.controller.js", 'performPasswordReset', res, error, 'An error occurred while resetting the password.');
    }
};

// Validates if a given password reset token is valid
export const validatePasswordResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({ code: 'INVALID_REQUEST', message: 'A reset token is required.' });
        }

        const tokenResult = await authRepository.validatePasswordResetToken(token);

        if (tokenResult?.length === 0) {
            return res.status(401).json({ code: 'INVALID_TOKEN', message: 'The reset token is invalid or has expired.' });
        }

        return res.status(200).json({ code: 'VALID_TOKEN', message: 'The reset token is valid.' });
    } catch (error) {
        handleError("auth.controller.js", 'validatePasswordResetToken', res, error, 'An error occurred while validating the reset token.');
    }
}

// Validates whether the current user session is active
export const validateActiveUserSession = async (req, res) => {
    try {
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const refreshToken = req.cookies?.refreshToken;
        const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const unique_id = decodedRefresh?.userDetails?.unique_id

        if (!refreshToken || !unique_id) {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing authentication tokens or user identifier.' });
        }

        const sessions = await authService.validateSession(unique_id, userAgent, refreshToken);

        if (sessions?.length > 0) {
            return res.status(200).json({ code: 'AUTHORIZED', message: 'Active session confirmed.' });
        } else {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Session is not active or has expired.' });
        }

    } catch (error) {
        handleError("auth.controller.js", 'validateActiveUserSession', res, error, 'An error occurred while validating the user session.');
    }
}

// Logs out the user by revoking the current session
export const logoutUser = async (req, res) => {
    try {

        const userAgent = req.headers['user-agent'] || 'Unknown';
        const unique_id = req.user?.unique_id
        if (!unique_id) {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        }

        const result = await authService.revokeSessions(unique_id, userAgent);

        if (result.affectedRows > 0) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return res.status(200).json({ code: 'LOGOUT_SUCCESS', message: 'You have been logged out successfully.' });
        } else {
            return res.status(400).json({ code: 'LOGOUT_FAILED', message: 'Logout failed. Please try again.' });
        }
    } catch (error) {
        handleError("auth.controller.js", 'logOut', res, error, 'error occurred during logout.');
    }
}