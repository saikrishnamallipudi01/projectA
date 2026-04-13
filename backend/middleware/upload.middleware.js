const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createFolders = () => {
    const folders = [
        path.join(__dirname, '../uploads'),
        path.join(__dirname, '../uploads/categories'),
        path.join(__dirname, '../uploads/services')
    ];
    folders.forEach(folder => {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }
    });
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        createFolders();
        if (req.originalUrl.includes('categories')) {
            cb(null, path.join(__dirname, '../uploads/categories'));
        } else if (req.originalUrl.includes('services')) {
            cb(null, path.join(__dirname, '../uploads/services'));
        } else {
            cb(null, path.join(__dirname, '../uploads'));
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const name = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        console.log(`[Multer] Saving file: ${name} to ${req.originalUrl}`);
        cb(null, name);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

module.exports = upload;
