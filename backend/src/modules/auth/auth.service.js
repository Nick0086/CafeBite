import * as authRepository from "./auth.repository.js";
import { sendOtpEmail } from "../../providers/nodemailer/nodemailer.provider.js";
import { HttpError } from "../../utils/errorHelper.js";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'DEV' ? false : true,
    sameSite: process.env.NODE_ENV === 'DEV' ? true : 'None',
    path: '/',
};

export const checkUserExists = async (loginId) => {
    const result = await authRepository.findUserByEmailOrMobile(loginId);
    if (result?.length === 0) {
        throw new HttpError("User account not found. Please verify the provided email or mobile number.", 404, "USER_NOT_FOUND");
    }
    return result;
};

export const fetchUserByLoginId = async (loginId) => {
    const result = await authRepository.findUserCredentialsByLoginId(loginId);
    if (result?.length === 0) {
        throw new HttpError("User account not found.", 404, "USER_NOT_FOUND");
    }
    return result;
};

export const checkPassword = async (password, hashedPassword) => {
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordValid) {
        throw new HttpError("The password you entered is incorrect.", 401, "INVALID_CREDENTIALS");
    }
    return true;
};

export const createOtp = async (otpSessionId, otp, expiresAt, loginType, loginId) => {
    const result = await authRepository.createOtp(otpSessionId, otp, expiresAt, loginType, loginId);
    if (result.affectedRows === 0) {
        throw new HttpError("Failed to store the OTP. Please try again later.", 500, "OTP_STORE_FAILED");
    }
    return result;
};

export const validateOtp = async (otpSessionId, otp) => {
    const result = await authRepository.findValidOtp(otpSessionId, otp);
    if (result?.length === 0) {
        throw new HttpError("The provided OTP is invalid or has expired.", 401, "INVALID_OTP");
    }
    return result;
};

export const createSession = async (sessionId, userId, userAgent, loginId, loginType, ipAddress, expiresAt, refreshToken) => {
    const result = await authRepository.createSession({ sessionId, userId, userAgent, loginId, loginType, ipAddress, expiresAt, refreshToken });
    if (result.affectedRows === 0) {
        throw new HttpError("Unable to create a user session at this time.", 500, "SESSION_CREATION_FAILED");
    }
    return result;
};

export const invalidateSessions = async (userId, userAgent) => {
    return await authRepository.updateSessionsRevoked(userId, userAgent);
};

export const createUserSession = async (userData, req) => {
    const sessionId = uuidv4();
    const userAgent = req?.headers?.['user-agent'] || 'Unknown';
    const ipAddress = req?.ip || 'Unknown';
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
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

    await authRepository.updateSessionsRevoked(unique_id, userAgent);
    await createSession(sessionId, unique_id, userAgent, loginId, loginType, ipAddress, expiresAt, refreshToken);

    return { sessionId, refreshToken, accessToken };
};

export const dispatchOtp = async (identifier, method, otpSessionId, otp) => {
    const message = `${otp} is your verification code. It will expire in 5 minutes.`;
    let sendResponse = false;

    if (method === 'EMAIL') {
        sendResponse = await sendOtpEmail({ toEmail: identifier, otp });
    } else {
        const { sendSMS } = await import("../../providers/twilio/twilio.provider.js");
        sendResponse = await sendSMS({ to: identifier, body: message });
    }

    if (!sendResponse) {
        throw new HttpError("Failed to send the OTP. Please try again later.", 500, "OTP_SEND_FAILED");
    }
    return true;
};

export const initiatePasswordReset = async (email) => {
    const user = await authRepository.findUserByEmail(email);
    if (!user || user?.length === 0) {
        throw new HttpError("No user account found with the provided email address.", 404, "USER_NOT_FOUND");
    }

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const response = await authRepository.createPasswordResetToken(user[0].unique_id, resetToken, expiresAt);
    if (response.affectedRows === 0) {
        throw new HttpError("Failed to store password reset token.", 500, "TOKEN_STORE_FAILED");
    }

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const emailResponse = await sendOtpEmail({
        toEmail: user[0]?.email,
        subject: 'Password Reset Request',
        otp: resetLink,
        type: 'reset',
    });

    if (!emailResponse) {
        throw new HttpError("Failed to send reset email.", 500, "EMAIL_SEND_FAILED");
    }
    return true;
};

export const processPasswordReset = async (token, newPassword) => {
    const tokenResult = await authRepository.findValidPasswordResetToken(token);
    if (tokenResult.length === 0) {
        throw new HttpError("The password reset token is invalid or has expired.", 401, "INVALID_TOKEN");
    }

    const tokenData = tokenResult[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await authRepository.updateUserPassword(tokenData.client_id, hashedPassword);
    if (!result || result.affectedRows === 0) {
        throw new HttpError("Failed to update password.", 500, "PASSWORD_UPDATE_FAILED");
    }

    await authRepository.deletePasswordResetToken(token);
    return true;
};

export const checkPasswordResetToken = async (token) => {
    const tokenResult = await authRepository.findValidPasswordResetToken(token);
    if (tokenResult?.length === 0) {
        throw new HttpError("The reset token is invalid or has expired.", 401, "INVALID_TOKEN");
    }
    return tokenResult;
};

export const fetchActiveSession = async (userId, userAgent, refreshToken) => {
    const sessions = await authRepository.findActiveSession(userId, userAgent, refreshToken);
    if (sessions?.length === 0) {
        throw new HttpError("Session is not active or has expired.", 402, "UNAUTHORIZED");
    }
    return sessions;
};

export { generateOtp };
