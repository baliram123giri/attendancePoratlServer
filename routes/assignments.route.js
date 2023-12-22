// const { } = require("../controllers/assignments/assignments.controller")
const router = require("express").Router()
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { assignmentCreateSchema } = require("../controllers/assignments/validation");
const { Assignments } = require("../models/assignment.mode");
const { authorize } = require("../utils/auth.util");
const { getAllAssignments, getSingleAssignment } = require("../controllers/assignments/assignments.controller");

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

router.post('/create', authorize("student"), upload.single('thumbnail'), async (req, res) => {
    try {
        await assignmentCreateSchema.validateAsync(req.body)
        const { gitUrl, title, netlifyUrl } = req.body
        // Compress and resize the image
        // const processedImageBuffer = await sharp(req.file.buffer)
        //     .jpeg({ quality: 80 })
        //     .resize({ width: 500, height: 500, fit: 'inside' })
        //     .toBuffer();
        const assignmentResult = await Assignments.create({ gitUrl, netlifyUrl, title, userId: res?.id })

        const publicId = `${String(assignmentResult?._id)}`;
        // Upload the processed image to Cloudinary
        cloudinary.uploader.upload_stream(
            { resource_type: 'image', public_id: publicId },
            async (error, result) => {
                if (error) {
                    await Assignments.findByIdAndDelete(assignmentResult?._id)
                    return res.status(500).json({ error: 'Error uploading to Cloudinary', error });
                }
                await Assignments.findByIdAndUpdate(assignmentResult?._id, {
                    thumbnail: result.url,
                });

                // Respond with the Cloudinary URL of the processed image
                res.json({ message: "Assignment Created Successfully" });

            }
        ).end(req.file.buffer);

    } catch (error) {
        console.error('Error processing image:', error.message);
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

router.get("/list", authorize("student"), getAllAssignments)
router.get("/:id", authorize("student"), getSingleAssignment)
router.put("/update/:id", authorize("student"), upload.single('thumbnail'), async (req, res) => {
    try {
        const { gitUrl, title, netlifyUrl } = req.body;
        // Check if an image was provided in the update
        const assignment = await Assignments.findById(req.params.id)
        if (!assignment) return res.status(400).json({ message: "Assignment not found" })
        if (req?.file) {
            // Compress and resize the new image
            // const processedImageBuffer = await sharp(req.file.buffer)
            //     .jpeg({ quality: 80 })
            //     .resize({ width: 320, height: 300, fit: 'inside' })
            //     .toBuffer();

            // Explicitly set the public ID for Cloudinary upload
            const publicId = `${req.params.id}`;

            // Upload the processed image to Cloudinary with the specified public ID
            cloudinary.uploader.upload_stream(
                { resource_type: 'image', public_id: publicId },
                async (error, result) => {
                    if (error) {
                        return res.status(500).json({ error: 'Error uploading to Cloudinary', error });
                    }

                    // Update assignment details in the database with the new Cloudinary URL
                    await Assignments.findByIdAndUpdate(req.params.id, {
                        gitUrl,
                        netlifyUrl,
                        title,
                        thumbnail: result.url,
                        userId: res?.id,
                    });

                    // Respond with a success message
                    res.json({ message: "Assignment Updated Successfully" });
                }
            ).end(req.file.buffer);
        } else {
            // If no new image is provided, update assignment details without changing the image
            await Assignments.findByIdAndUpdate(req.params.id, {
                gitUrl,
                netlifyUrl,
                title,
                userId: res?.id,
            });

            // Respond with a success message
            res.json({ message: "Assignment Updated Successfully" });
        }
    } catch (error) {
        console.error('Error processing image:', error.message);
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

router.delete("/delete/:id", authorize("student"), async (req, res) => {
    try {
        const assignment = await Assignments.findById(req.params.id)
        if (!assignment) return res.status(400).json({ message: "Assignment not found" })
        cloudinary.api.delete_resources(req.params.id, async (err, result) => {
            if (err) {
                return res.status(500).json({ message: "File delete error", err })
            } else {
                await Assignments.deleteOne({ _id: req.params?.id })
                return res.json({ message: "Deleted Successfully" })
            }
        })


    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
})

module.exports = router