const multer = require('multer');
const fs = require('node:fs');

class FileUploader {
    constructor({ folderName = 'uploads', supportedFiles = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'], fileSize = 1024 * 1024 * 2 }) {
        this.folderName = folderName;
        this.supportedFiles = supportedFiles;
        this.fileSize = fileSize;

        if (!fs.existsSync(this.folderName)) {
            fs.mkdirSync(this.folderName, { recursive: true });
        }
    }

    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, this.folderName);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = file.mimetype.split('/')[1];
            cb(null, `${file.originalname.split('.')[0]}-${uniqueSuffix}.${extension}`);
        }
    });

    fileFilter = (req, file, cb) => {
        const isAcceptedFile = this.supportedFiles.includes(file.mimetype);
        if (isAcceptedFile) {
            cb(null, true);
        } else {
            req.flash('error', `This file is not accepted, accepted files are ${this.supportedFiles.join(', ')}`);
            cb(null, false);
        }
    };

    upload = multer({
        storage: this.storage,
        fileFilter: this.fileFilter,
        limits: { fileSize: this.fileSize }
    });
}

module.exports = FileUploader;
