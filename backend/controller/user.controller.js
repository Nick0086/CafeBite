import query from "../utils/query.utils.js";
import bcrypt from 'bcrypt';
import { createUniqueId, handleError } from "../utils/utils.js";
import { convertEmptyStringsToNull } from "../utils/convertEmptyStringsToNull.js";
import multer from "multer";
import { deleteObjectFromS3, getSignedUrlFromS3, uploadstreamToS3 } from "../services/r2/r2.service.js";

const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG And PNG files are allowed'));
        }
        cb(null, true);
    }
});

export const registerClient = async (req, res) => {
    try {

        await new Promise((resolve, reject) => {
            upload.single('cafeLogo')(req, res, (err) => {
                if (err) {
                    console.error("registerClient :- Error uploading image:", err);
                    return res.status(400).json({
                        status: "error",
                        code: "IMAGE_UPLOAD_ERROR",
                        message: err.message || "Error while uploading the image"
                    });
                }
                resolve();
            });
        });

        if (!req.file) {
            return res.status(400).json({ message: 'Image is required', status: 'error' });
        };

        const clientId = createUniqueId('CLIENT');
        const { originalname, buffer, mimetype } = req.file;
        const fileName = `${clientId}_${Date.now()}_${originalname}`
        const key = `profile/${fileName?.split('.')[0]}`;
        const fullPath = `${key}`;

        const options = {
            folder: key,
            public_id: fileName,
            resource_type: 'auto',
            overwrite: false,
            format: 'webp',
        };

        try {
            const fileUploadResult = await uploadstreamToS3(buffer, options);
            // if (!fileUploadResult?.secure_url) {
            //     throw new Error('Upload succeeded but no secure URL returned');
            // }

            console.log("File uploaded successfully:", key, fileUploadResult);
        } catch (error) {
            console.error("Error uploading image to Cloudinary:", error);
            throw error; // Let caller handle the error
        }

        const { firstName, lastName, email, phoneNumber, password, cafeName, cafeDescription, cafeAddress, cafeCity, cafeState, cafeCountry, cafeZip, cafeCurrency, cafePhone, cafeEmail, cafeWebsite, socialInstagram, socialFacebook, socialTwitter } = convertEmptyStringsToNull(req.body);

        const hashedPassword = await bcrypt.hash(password, 10);

        const checkExustingUser = await query(`SELECT * FROM clients WHERE email = ?`, [email]);

        if (checkExustingUser?.length > 0) {
            return res.status(400).json({ message: 'Email or mobile already exists' });
        }

        const sql = `INSERT INTO clients (unique_id, first_name, last_name, mobile, email, password, cafe_name, cafe_description, logo_url, address_line1, city_id, state_id, country_id, postal_code, currency_code, cafe_phone, cafe_email, cafe_website, social_instagram, social_facebook, social_twitter ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const result = await query(sql, [clientId, firstName, lastName, phoneNumber, email, hashedPassword, cafeName, cafeDescription, fullPath, cafeAddress, cafeCity, cafeState, cafeCountry, cafeZip, cafeCurrency, cafePhone, cafeEmail, cafeWebsite, socialInstagram, socialFacebook, socialTwitter]);

        if (result?.affectedRows > 0) {
            const today = new Date();
            const nextMonth = new Date();
            nextMonth.setMonth(today.getMonth() + 1);
            nextMonth.setDate(nextMonth.getDate() + 1); // Add 1-day buffer for global users

            const subscriptionSQL = ` INSERT INTO client_subscriptions  (client_id, razorpay_subscription_id, plan_name, amount, currency, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            const subscriptionValues = [clientId, `TRIAL_${clientId}`, 'Free Trial (1 month)', 0.00, 'USD', today.toISOString().split('T')[0], nextMonth.toISOString().split('T')[0], 'trial'];

            await query(subscriptionSQL, subscriptionValues);


            return res.status(201).json({ message: 'User created successfully' });
        } else {
            return res.status(400).json({ message: 'Failed to create user' });
        }

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            handleError('user.controller.js', 'registerUser', res, error, 'Email or mobile already exists')
        } else {
            handleError('user.controller.js', 'registerUser', res, error, error.message)
        }
    }
}

export const updateClientProfile = async (req, res) => {
    try {

        await new Promise((resolve, reject) => {
            upload.single('cafeLogo')(req, res, (err) => {
                if (err) {
                    console.error("updateClientProfile :- Error uploading image:", err);
                    return res.status(400).json({
                        status: "error",
                        code: "IMAGE_UPLOAD_ERROR",
                        message: err.message || "Error while uploading the image"
                    });
                }
                resolve();
            });
        });

        const clientId = req.user?.unique_id;
        const { firstName, lastName, email, phoneNumber, cafeName, cafeDescription, cafeAddress, cafeCountry, cafeState, cafeCity, cafeZip, cafeCurrency, cafePhone, cafeEmail, cafeWebsite, socialInstagram, socialFacebook, socialTwitter } = convertEmptyStringsToNull(req.body);

        const checkExustingUser = await query(`SELECT * FROM clients WHERE email = ? AND unique_id != ?`, [email, clientId]);
        const updateUserOldData = await query(`SELECT * FROM clients WHERE unique_id = ?`, [clientId]);

        if (checkExustingUser?.length > 0) {
            return res.status(400).json({ message: 'Email or mobile already exists' });
        }

        if (!updateUserOldData?.length) {
            return res.status(400).json({ message: 'User not found' });
        }

        var fullPath = updateUserOldData[0]?.logo_url;
        if (req?.file) {
            await deleteObjectFromS3(updateUserOldData[0]?.logo_url);
            const clientId = createUniqueId('CLIENT');
            const { originalname, buffer, mimetype } = req.file;
            const fileName = `${clientId}_${Date.now()}_${originalname}`
            const key = `profile/${fileName?.split('.')[0]}`;
            fullPath = `${key}`;

            const options = {
                folder: key,
                public_id: fileName,
                resource_type: 'auto',
                overwrite: false,
                format: 'webp',
            };

            try {
                const fileUploadResult = await uploadstreamToS3(buffer, options);
                // if (!fileUploadResult?.secure_url) {
                //     throw new Error('Upload succeeded but no secure URL returned');
                // }

                console.log("File uploaded successfully:", key, fileUploadResult);
            } catch (error) {
                console.error("Error uploading image to Cloudinary:", error);
                throw error; // Let caller handle the error
            }
        }

        const sql = `UPDATE clients SET first_name = ?, last_name = ?, email = ?, mobile = ?, cafe_name = ?, cafe_description = ?, address_line1 = ?, city_id = ?, state_id = ?, country_id = ?, postal_code = ?, currency_code = ?, cafe_phone = ?, cafe_email = ?, cafe_website = ?, social_instagram = ?, social_facebook = ?, social_twitter = ?, logo_url = ? WHERE unique_id = ?`;

        const result = await query(sql, [firstName, lastName, email, phoneNumber, cafeName, cafeDescription, cafeAddress, cafeCity, cafeState, cafeCountry, cafeZip, cafeCurrency, cafePhone, cafeEmail, cafeWebsite, socialInstagram, socialFacebook, socialTwitter, fullPath, clientId]);

        if (result?.affectedRows > 0) {
            return res.status(200).json({ message: 'User updated successfully' });
        } else {
            return res.status(400).json({ message: 'Failed to update user' });
        }



    } catch (error) {
        handleError('user.controller.js', 'updateClientProfile', res, error, error.message)
    }
}

export const getClinetDataById = async (req, res) => {
    try {
        const unique_id = req.user?.unique_id;

        if (!unique_id) {
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing user identifier.' });
        }

        const result = await query(`
            SELECT 
                cli.*, 
                cur.name AS currency_name, 
                cur.symbol AS currency_symbol,
                sub.plan_name,
                sub.amount,
                sub.currency AS subscription_currency,
                sub.start_date,
                sub.end_date,
                sub.status AS subscription_status
            FROM clients AS cli
            LEFT JOIN currencies AS cur ON cli.currency_code = cur.code
            LEFT JOIN client_subscriptions AS sub ON cli.unique_id = sub.client_id
            WHERE cli.unique_id = ?
        `, [unique_id]);

        if (!result || result.length === 0) {
            return res.status(404).json({ CODE: 'NOT_FOUND', status: 'error', message: 'User not found' });
        }

        const user = result[0];

        // Add signed logo URL if available
        if (user.logo_url) {
            user.logo_signed_url = await getSignedUrlFromS3(user.logo_url, 86400);
        }

        // Prepare subscription object if available
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

        // Remove raw subscription fields to avoid duplication
        delete user.plan_name;
        delete user.amount;
        delete user.subscription_currency;
        delete user.start_date;
        delete user.end_date;
        delete user.subscription_status;

        return res.status(200).json({ CODE: 'SUCCESS', status: 'success', data: user });

    } catch (error) {
        handleError("user.controller.js", 'getClinetDataById', res, error, 'An error occurred while validating the user session.');
    }
};
