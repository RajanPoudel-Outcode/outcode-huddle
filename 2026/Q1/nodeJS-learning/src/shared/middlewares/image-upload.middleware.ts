import { Request } from 'express';
import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';

// Multer setup for file uploads
const storage: StorageEngine = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, './uploads');
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, uniqueSuffix + fileExtension);
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, callback: FileFilterCallback): void => {
    const allowedFileTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    
    if (!allowedFileTypes.includes(file.mimetype)) {
        const error = new Error("This filetype is not supported. Only PNG, JPG, and JPEG files are allowed.");
        return callback(error);
    }
    
    callback(null, true);
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 2 // 2MB limit
    }
});

export default upload;
