import crypto from 'crypto';

/**
 * Decodes a Base32 string into a Buffer.
 * @param {string} base32 - Base32 encoded string
 * @returns {Buffer}
 */
const base32ToBuffer = (base32) => {
    const cleaned = base32.replace(/=+$/, '').toUpperCase().replace(/[\s-]/g, '');
    const charTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    
    for (let i = 0; i < cleaned.length; i++) {
        const val = charTable.indexOf(cleaned.charAt(i));
        if (val === -1) {
            throw new Error(`Invalid Base32 character: ${cleaned.charAt(i)}`);
        }
        bits += val.toString(2).padStart(5, '0');
    }

    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.substring(i, i + 8), 2));
    }
    return Buffer.from(bytes);
};

/**
 * Generates a 6-digit TOTP token for a given counter and secret buffer.
 * @param {Buffer} secretBuffer 
 * @param {number} counter 
 * @returns {string} 6-digit PIN
 */
const generateHOTP = (secretBuffer, counter) => {
    const counterBuffer = Buffer.alloc(8);
    // Write 64-bit integer in big-endian format (high 32 bits zero, low 32 bits counter)
    counterBuffer.writeUInt32BE(0, 0);
    counterBuffer.writeUInt32BE(counter, 4);

    const hmac = crypto.createHmac('sha1', secretBuffer);
    hmac.update(counterBuffer);
    const digest = hmac.digest();

    const offset = digest[digest.length - 1] & 0x0f;
    const binary =
        ((digest[offset] & 0x7f) << 24) |
        ((digest[offset + 1] & 0xff) << 16) |
        ((digest[offset + 2] & 0xff) << 8) |
        (digest[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
};

/**
 * Generates current 6-digit TOTP PIN for a Base32 secret key.
 * @param {string} secretBase32 
 * @param {number} [timeOffsetSeconds=0] 
 * @returns {string}
 */
export const generateTotpPin = (secretBase32, timeOffsetSeconds = 0) => {
    const secretBuffer = base32ToBuffer(secretBase32);
    const epoch = Math.floor((Date.now() / 1000 + timeOffsetSeconds) / 30);
    return generateHOTP(secretBuffer, epoch);
};

/**
 * Verifies a 6-digit TOTP pin against a Base32 secret key with optional clock skew window.
 * @param {string} pin - 6 digit input PIN
 * @param {string} secretBase32 - Base32 secret string (e.g. ADMIN_TOTP_SECRET)
 * @param {number} [window=1] - Clock skew window (1 = ±30 seconds)
 * @returns {boolean}
 */
export const verifyTotpPin = (pin, secretBase32, window = 1) => {
    if (!pin || typeof pin !== 'string' || !/^\d{6}$/.test(pin.trim())) {
        return false;
    }
    const cleanPin = pin.trim();

    try {
        const secretBuffer = base32ToBuffer(secretBase32);
        const currentCounter = Math.floor(Date.now() / 1000 / 30);

        for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
            const counter = currentCounter + errorWindow;
            const generatedPin = generateHOTP(secretBuffer, counter);
            if (crypto.timingSafeEqual(Buffer.from(cleanPin), Buffer.from(generatedPin))) {
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('TOTP verification error:', error);
        return false;
    }
};
