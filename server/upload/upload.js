// import multer from 'multer';
// import multerS3 from 'multer-s3';
// import { S3Client } from '@aws-sdk/client-s3';
// import path from 'path';
// import dotenv from 'dotenv';

// dotenv.config(); // Load environment variables from .env file

// // Configure AWS SDK v3 S3 client
// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//   }
// });

// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.AWS_S3_BUCKET_NAME,
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//       cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
//   }),
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Not an image! Please upload an image.', false));
//     }
//   },
//   limits: {
//     fileSize: 1024 * 1024 * 5 // 5MB file size limit
//   }
// });

// // Use upload.fields() to handle multiple file uploads
// export const uploadPhotos = upload.fields([
//   { name: 'photo', maxCount: 1 },
//   { name: 'photo1', maxCount: 1 },
//   { name: 'photo2', maxCount: 1 }
// ]);

// export default upload;


import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Configure AWS SDK v3 S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Configure multer with multerS3 storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Not an image! Please upload an image.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// Use upload.fields() to handle multiple file uploads for specific fields
export const uploadPhotos = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'photo1', maxCount: 1 },
  { name: 'photo2', maxCount: 1 }
]);

export default upload;
