const crypto = require('crypto');
const dotenv = require("dotenv");
dotenv.config();

const algorithm = "aes-256-gcm";
const iv_length = 12; // For GCM

const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

if (!key || key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be a 32-byte hex string");
}

const encrypt = (text) => {
    const iv = crypto.randomBytes(iv_length);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

const decrypt = (encryptedBase64) => {
    const data = Buffer.from(encryptedBase64, 'base64');
    const iv = data.subarray(0, iv_length);
    const encrypted = data.subarray(iv_length, data.length - 16);
    const authTag = data.subarray(data.length - 16);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
}

module.exports = { encrypt, decrypt };
