const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const path = require("path");

const fs = require("fs");

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Upload a file to S3 or fallback to local storage
 * @param {Object} file - The file object from multer
 * @param {string} folder - The folder in the bucket (e.g. 'menu-items')
 * @returns {Promise<string>} - The URL of the uploaded file
 */
const uploadToS3 = async (file, folder = "menu-items") => {
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
  const fullPath = `${folder}/${fileName}`;

  // Check if S3 is configured (i.e. not using placeholders)
  const isS3Configured = 
    process.env.AWS_S3_BUCKET_NAME && 
    process.env.AWS_S3_BUCKET_NAME !== 'your_bucket_name' &&
    process.env.AWS_ACCESS_KEY_ID !== 'your_access_key_id';

  if (!isS3Configured) {
    console.log("S3 not configured. Falling back to local storage...");
    
    // Ensure local directory exists
    const localDir = path.join(__dirname, "../public/uploads", folder);
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    const localFilePath = path.join(localDir, fileName);
    fs.writeFileSync(localFilePath, file.buffer);
    
    // Return local URL (assumes server runs on port in .env)
    const port = process.env.PORT || 5000;
    return `http://localhost:${port}/uploads/${folder}/${fileName}`;
  }

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fullPath,
      Body: file.buffer,
      ContentType: file.mimetype,
    },
  });

  const result = await upload.done();
  return result.Location || `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fullPath}`;
};

module.exports = {
  uploadToS3,
};
