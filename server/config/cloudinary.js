// This file is used to configure cloudinary for image uploads. or in detail :
// Its sets up cloudinary with the necessary credentials and creates a storage object allowing the app to upload images directly to cloudinary using multer-storage-cloudinary.

// multer is a middleware for handling multipart/form-data, which is primarily used for uploading files.
// multer-storage-cloudinary is a storage engine for multer to directly upload files to cloudinary from the server.
// a storage engine simply means a way to define where and how the upload files should be stored. Its consists of configuration settings like folder name, allowed file formats, transformations etc...

const cloudinary = require('cloudinary').v2; // for cloudinary api v2 - con
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// configure cloudinary with credentials from env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// create a storage object for multer-storage-cloudinary and define the rules for uploading images

const storage = new CloudinaryStorage({
    cloudinary: cloudinary, // use the configured cloudinary instance
    params: {
        folder: 'rentacar', // folder name to use in cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'], // allowed image formats
        // transformation: [{width : 500, height : 500, crop : 'scale'}] // resize images to 500x500 and scale them }]
    }
})

// initialize the multer
const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };