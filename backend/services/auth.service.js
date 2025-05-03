import bcrypt from 'bcrypt';
import authRepository from '../repositories/auth.repositories.js';
import { sendOtpEmail } from './nodemailer/nodemailer.service.js';
const checkUserExists = async (loginId) => {
    try {
        const result = await authRepository.findByEmailOrMobile(loginId);
        return result;
    } catch (error) {
        throw new Error(`Failed to check user existence: ${error.message}`);
    }
}

const getUserByLoginId = async (loginId) => {
    try {
        const sessionId = await authRepository.getUserByLoginId(loginId);
        return sessionId;
    } catch (error) {
        throw new Error(`Failed to get user by login ID: ${error.message}`);
    }
}

const storeOtp = async (otpSessionId, otp, expiresAt, loginType, loginId) => {
    try {
        const result = await authRepository.storeOtp(otpSessionId, otp, expiresAt, loginType, loginId);
        return result;
    } catch (error) {
        throw new Error(`Failed to store OTP: ${error.message}`);
    }
}

const verifyOtp = async (otpSessionId, otp) => {
    try {
        const result = await authRepository.verifyOtp(otpSessionId, otp);
        return result;
    } catch (error) {
        throw new Error(`Failed to verify OTP: ${error.message}`);
    }
}

const createSession = async (sessionId, userId, userAgent, loginId, loginType, ipAddress, expiresAt, refreshToken) => {
    try {
        const result = await authRepository.createSession(sessionId, userId, userAgent, loginId, loginType, ipAddress, expiresAt, refreshToken);
        return result;
    } catch (error) {
        throw new Error(`Failed to create session: ${error.message}`);
    }
}

const revokeSessions = async (userId, userAgent) => {
    try {
        const result = await authRepository.revokeSessions(userId, userAgent);
        return result;
    } catch (error) {
        throw new Error(`Failed to revoke sessions: ${error.message}`);
    }
}

const getUserByEmail = async (email) => {
    try {
        const result = await authRepository.getUserByEmail(email);
        return result;
    } catch (error) {
        throw new Error(`Failed to get user by email: ${error.message}`);
    }
}

const requestPasswordReset = async (email) => {
    try {

        const user = await getUserByEmail(email);
        if (!user) {
            return false;
        }

        const resetToken = uuidv4();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const response = await authRepository.storePasswordResetToken(user.unique_id, resetToken, expiresAt);
        if (response.affectedRows === 0) {
            return false;
        }

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        const emailResponse = await sendOtpEmail({
            toEmail: user.email,
            subject: 'Password Reset Request',
            otp: resetLink,
            type: 'reset',
        });

        return !!emailResponse;
    } catch (error) {
        throw new Error(`Failed to request password reset: ${error.message}`);
    }
};

const updateUserPassword = async (userId, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await authRepository.updateUserPassword(userId, hashedPassword);
        return result;
    } catch (error) {
        throw new Error(`Failed to update user password: ${error.message}`);
    }
}

const performPasswordReset = async (token, newPassword) => {
    try {

        const tokenResult = await authRepository.validatePasswordResetToken(token);
        if (tokenResult.length === 0) {
            return false;
        }

        const tokenData = tokenResult[0];
        const result = await updateUserPassword(tokenData.client_id, newPassword);
        if (!result) {
            return false;
        }

        await authRepository.deletePasswordResetToken(token);
        return true;

    } catch (error) {
        throw new Error(`Failed to validate password reset token: ${error.message}`);
    }
}

const deletePasswordResetToken = async (token) => {
    try {
        const result = await authRepository.deletePasswordResetToken(token);
        return result;
    } catch (error) {
        throw new Error(`Failed to delete password reset token: ${error.message}`);
    }
}

const createUserSession = async (info) => {
    try {
        const sessionId = await authRepository.createSession(info);
        return sessionId;
    } catch (error) {
        throw new Error(`Failed to create user session: ${error.message}`);
    }
}

const validateSession = async (userId, userAgent, refreshToken) => {
    try {
        const result = await authRepository.validateSession(userId, userAgent, refreshToken);
        return result;
    } catch (error) {
        throw new Error(`Failed to validate session: ${error.message}`);
    }
}


export default {
    createUserSession,
    performPasswordReset,
    updateUserPassword,
    checkUserExists,
    validateSession,
    revokeSessions,
    deletePasswordResetToken,
    getUserByEmail,
    getUserByLoginId,
    storeOtp,
    verifyOtp,
    requestPasswordReset,
    createSession,
};