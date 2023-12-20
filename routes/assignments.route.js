// const { } = require("../controllers/assignments/assignments.controller")
const router = require("express").Router()
const multer = require('multer');
const sharp = require('sharp');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { assignmentCreateSchema } = require("../controllers/assignments/validation");

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dhlyinfwd',
    api_key: '729467363935785',
    api_secret: 'nQTW3NvgsrKYY9coQgodHYSRTTQ',
});

// Configure Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define the upload endpoint

router.post('/create', upload.single('thumbnail'), async (req, res) => {
    try {
        await assignmentCreateSchema.validateAsync(req.body)
        const { gitUrl, title, netlifyUrl } = req.body
        // Compress and resize the image
        const processedImageBuffer = await sharp(req.file.buffer)
            .jpeg({ quality: 80 })
            .resize({ width: 200, height: 200, fit: 'inside' })
            .toBuffer();

        // Upload the processed image to Cloudinary
        const cloudinaryUploadResult = await cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            (error, result) => {
                if (error) {
                    return res.status(500).json({ error: 'Error uploading to Cloudinary' });
                }

                // Respond with the Cloudinary URL of the processed image
                res.json({ imageUrl: result.url });


            }
        ).end(processedImageBuffer);
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (unlinkError) => {
                if (unlinkError) {
                    console.error('Error removing uploaded file:', unlinkError);
                } else {
                    console.log('Uploaded file removed from the local file system');
                }
            });
        }
    }
});


module.exports = router