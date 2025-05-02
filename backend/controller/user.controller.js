import query from "../utils/query.utils.js";
import bcrypt from 'bcrypt';
import { createUniqueId, handleError } from "../utils/utils.js";
import { convertEmptyStringsToNull } from "../utils/convertEmptyStringsToNull.js";
import multer from "multer";
import { uploadStreamToCloudinary } from "../services/cloudinary/cloudinary.service.js";

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
        const key = `profile/${fileName}`;

        const options = {
            folder: key,
            public_id: fileName,
            resource_type: 'auto',
            overwrite: false,
            format: 'webp',
        };

        try {
            const fileUploadResult = await uploadStreamToCloudinary(buffer, options);
            if (!fileUploadResult?.secure_url) {
                throw new Error('Upload succeeded but no secure URL returned');
            }
    
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
        const result = await query(sql, [clientId, firstName, lastName, phoneNumber, email, hashedPassword, cafeName, cafeDescription, key, cafeAddress, cafeCity, cafeState, cafeCountry, cafeZip, cafeCurrency, cafePhone, cafeEmail, cafeWebsite, socialInstagram, socialFacebook, socialTwitter]);

        if (result?.affectedRows > 0) {
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