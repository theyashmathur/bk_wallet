import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const algorithm = "aes-256-gcm";
const key = process.env.ENCRYPTION_KEY;
const iv_length = 12; // For GCM, the IV length is 12 bytes

export const encrypt = (text) => {
    const iv = crypto.randomBytes(iv_length);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Return IV, encrypted data, and auth tag
    return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export const decrypt = (encryptedBase64) => {
    const data = Buffer.from(encryptedBase64, 'base64');
    const iv = data.subarray(0, iv_length);
    const encrypted = data.subarray(iv_length, data.length - 16);
    const authTag = data.subarray(data.length - 16);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
}