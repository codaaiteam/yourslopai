import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '5a531a8cd1367b69cdfd8a3665a9052b';
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'youraislopsme';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://cdn.youraislopboresmegame.com';

let client = null;

function getClient() {
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
}

/**
 * Upload a buffer to R2 and return the public URL
 * @param {Buffer} buffer - file content
 * @param {string} key - object key (path in bucket)
 * @param {string} contentType - MIME type
 * @returns {string} public URL
 */
export async function uploadToR2(buffer, key, contentType = 'image/png') {
  const s3 = getClient();
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  return `${R2_PUBLIC_URL}/${key}`;
}
