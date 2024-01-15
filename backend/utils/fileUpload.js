const multer = require('multer');
const path = require('path');
const fs = require('fs').promises; // Use the promisified version of fs
const express = require('express');
const app = express();
app.use(express.json({ limit: '1mb' })); 


const MAX_DISK_SPACE = 1024 * 1024 * 1024; // 1 GB maximum disk space for uploads

// Validate if the destination directory exists
const destination = "./uploads/images";

function ensureDirectoryExists(directoryPath) {
    return fs.access(directoryPath)
        .then(() => true) // Directory exists
        .catch(() => fs.mkdir(directoryPath)); // Directory doesn't exist, create it
}

function checkDiskSpace(destinationPath) {
    return fs.stat(destinationPath)
        .then(stat => {
            if (stat.size < MAX_DISK_SPACE) {
                return true; // There is sufficient disk space
            } else {
                throw new Error("Insufficient disk space for file upload");
            }
        })
        .catch(error => {
            throw new Error("Error checking disk space: " + error.message);
        });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        ensureDirectoryExists(destination)
            .then(() => checkDiskSpace(destination))
            .then(hasDiskSpace => {
                if (hasDiskSpace) {
                    cb(null, destination);
                } else {
                    throw new Error("Insufficient disk space for file upload");
                }
            })
            .catch(error => {
                cb(error, null);
            });
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    },
});

const fileUpload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("only .png, .jpg, .jpeg format allowed"));
        }
    },
    onError: (err, next) => {
        console.log('error', err);
        next(err);
    },
}).single('image');

module.exports = fileUpload;
