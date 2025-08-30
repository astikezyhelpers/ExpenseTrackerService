import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const uploadDirBase = path.join(process.cwd(), 'public', 'uploads');

const ensureFolderExists = (folderName) => {
  const fullPath = path.join(uploadDirBase, folderName);
  fs.mkdirSync(fullPath, { recursive: true });
  return fullPath;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.uploadType || 'others'; // fallback if not set
    const dir = ensureFolderExists(type);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueId = uuidv4();
    cb(null, `${uniqueId}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only images or PDFs are allowed'), false);
};

const upload = multer({ storage, fileFilter });

/**
 * Middleware factory - sets upload type and returns multer middleware
 * @param { 'receipts' | 'avatars' | 'others' } type
 */
export const uploadFile = (type = 'others') => {
  return [
    (req, res, next) => {
      req.uploadType = type; // pass type to multer
      next();
    },
    upload.single('file'), // use field name 'file'
  ];
};
