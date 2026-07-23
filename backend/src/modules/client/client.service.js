import * as clientRepository from "./client.repository.js";
import { createUniqueId } from "../../utils/utils.js";
import { convertEmptyStringsToNull } from "../../utils/convertEmptyStringsToNull.js";
import { uploadObject, deleteObject, getSignedUrl } from "../../providers/minio/minio.provider.js";
import { HttpError } from "../../utils/errorHelper.js";
import bcrypt from 'bcrypt';

export const createClient = async (file, body) => {
    if (!file) {
        throw new HttpError("Image is required", 400, "IMAGE_REQUIRED");
    }

    const clientId = createUniqueId('CLIENT');
    const { originalname, buffer } = file;
    const fileName = `${clientId}_${Date.now()}_${originalname}`;
    const key = `profile/${fileName.split('.')[0]}`;
    const fullPath = key;

    try {
        await uploadObject(buffer, key);
    } catch (error) {
        throw new HttpError(`Error uploading image: ${error.message}`, 500, "IMAGE_UPLOAD_ERROR");
    }

    const {
        firstName, lastName, email, phoneNumber, password, cafeName, cafeDescription,
        cafeAddress, cafeCity, cafeState, cafeCountry, cafeZip, cafeCurrency, cafePhone,
        cafeEmail, cafeWebsite, socialInstagram, socialFacebook, socialTwitter
    } = convertEmptyStringsToNull(body);

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingClient = await clientRepository.findClientByEmail(email);
    if (existingClient?.length > 0) {
        throw new HttpError("Email or mobile already exists", 400, "DUPLICATE_ENTRY");
    }

    const clientData = {
        clientId, firstName, lastName, phoneNumber, email, hashedPassword,
        cafeName, cafeDescription, fullPath, cafeAddress, cafeCity, cafeState,
        cafeCountry, cafeZip, cafeCurrency, cafePhone, cafeEmail, cafeWebsite,
        socialInstagram, socialFacebook, socialTwitter
    };

    const result = await clientRepository.createClient(clientData);
    if (result?.affectedRows > 0) {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);
        nextMonth.setDate(nextMonth.getDate() + 1);

        const subscriptionData = {
            clientId,
            subscriptionId: `TRIAL_${clientId}`,
            planName: 'Free Trial (1 month)',
            amount: 0.00,
            currency: 'USD',
            startDate: today.toISOString().split('T')[0],
            endDate: nextMonth.toISOString().split('T')[0],
            status: 'trial'
        };

        await clientRepository.createClientSubscription(subscriptionData);
        return { message: 'User created successfully' };
    }

    throw new HttpError("Failed to create user", 400, "CLIENT_CREATION_FAILED");
};

export const updateClientProfile = async (clientId, file, body) => {
    const { firstName, lastName, email, phoneNumber, cafeName, cafeDescription, cafeAddress, cafeCountry, cafeState, cafeCity, cafeZip, cafeCurrency, cafePhone, cafeEmail, cafeWebsite, socialInstagram, socialFacebook, socialTwitter } = convertEmptyStringsToNull(body);

    const existingClient = await clientRepository.findClientByEmailExcludeId(email, clientId);
    if (existingClient?.length > 0) {
        throw new HttpError("Email or mobile already exists", 400, "DUPLICATE_ENTRY");
    }

    const oldClientData = await clientRepository.findClientById(clientId);
    if (!oldClientData?.length) {
        throw new HttpError("User not found", 400, "USER_NOT_FOUND");
    }

    let fullPath = oldClientData[0]?.logo_url;

    if (file) {
        await deleteObject(oldClientData[0]?.logo_url);

        const newClientId = createUniqueId('CLIENT');
        const { originalname, buffer } = file;
        const fileName = `${newClientId}_${Date.now()}_${originalname}`;
        const key = `profile/${fileName.split('.')[0]}`;
        fullPath = key;

        try {
            await uploadObject(buffer, key);
        } catch (error) {
            throw new HttpError(`Error uploading image: ${error.message}`, 500, "IMAGE_UPLOAD_ERROR");
        }
    }

    const updateData = {
        firstName, lastName, email, phoneNumber, cafeName, cafeDescription,
        cafeAddress, cafeCity, cafeState, cafeCountry, cafeZip, cafeCurrency,
        cafePhone, cafeEmail, cafeWebsite, socialInstagram, socialFacebook,
        socialTwitter, fullPath
    };

    const result = await clientRepository.updateClientById(clientId, updateData);
    if (result?.affectedRows > 0) {
        return { message: 'User updated successfully' };
    }

    throw new HttpError("Failed to update user", 400, "CLIENT_UPDATE_FAILED");
};

export const fetchClientDataById = async (clientId) => {
    if (!clientId) {
        throw new HttpError("Missing user identifier", 401, "UNAUTHORIZED");
    }

    const result = await clientRepository.findClientDataById(clientId);
    if (!result || result.length === 0) {
        throw new HttpError("User not found", 404, "NOT_FOUND");
    }

    const user = result[0];

    if (user.logo_url) {
        user.logo_signed_url = await getSignedUrl(user.logo_url, 86400);
    }

    if (user.plan_name && user.start_date && user.end_date) {
        const today = new Date();
        const endDate = new Date(user.end_date);
        const isExpired = today > endDate;

        user.subscription = {
            plan_name: user.plan_name,
            amount: user.amount,
            currency: user.subscription_currency,
            start_date: user.start_date,
            end_date: user.end_date,
            status: user.subscription_status,
            is_expired: isExpired,
            remaining_days: Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)))
        };
    } else {
        user.subscription = null;
    }

    delete user.plan_name;
    delete user.amount;
    delete user.subscription_currency;
    delete user.start_date;
    delete user.end_date;
    delete user.subscription_status;

    return user;
};
