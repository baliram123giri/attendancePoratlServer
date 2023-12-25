// const { } = require("../controllers/assignments/assignments.controller")
const router = require("express").Router()
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { assignmentCreateSchema } = require("../controllers/assignments/validation");
const { Assignments } = require("../models/assignment.mode");
const { authorize, generateRandomId } = require("../utils/auth.util");
const { getAllAssignments, getSingleAssignment } = require("../controllers/assignments/assignments.controller");

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLODINARY_NAME,
    api_key: process.env.CLODINARY_KEY,
    api_secret: process.env.CLODINARY_SECRET,
});

// Configure Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define the upload endpoint

router.post('/create', authorize("student", "admin"), upload.single('thumbnail'), async (req, res) => {
    try {
        await assignmentCreateSchema.validateAsync(req.body)
        const { gitUrl, title, netlifyUrl } = req.body



        const publicId = `${String(generateRandomId())}`;
        // Upload the processed image to Cloudinary
        cloudinary.uploader.upload_stream(
            {
                resource_type: 'image', public_id: publicId, transformation: {
                    quality: 'auto:low', // You can experiment with different values
                },
                folder: "Assignment"
            },
            async (error, result) => {
                if (error) {
                    console.error('Error uploading to Cloudinary:', error.message);
                    return res.status(500).json({ error: 'Error uploading to Cloudinary', error });
                }
                await Assignments.create({ _id: publicId, gitUrl, netlifyUrl, title, userId: res?.id, thumbnail: result.url })
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

router.get("/list", authorize("student", "admin"), getAllAssignments)
router.get("/:id", authorize("student", "admin"), getSingleAssignment)
router.put("/update/:id", authorize("student", "admin"), upload.single('thumbnail'), async (req, res) => {
    try {
        const { gitUrl, title, netlifyUrl } = req.body;
        // Check if an image was provided in the update
        const assignment = await Assignments.findById(req.params.id)
        if (!assignment) return res.status(400).json({ message: "Assignment not found" })
        if (req?.file) {
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

router.delete("/delete/:id", authorize("student", "admin"), async (req, res) => {
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

Assignments.watch().on("change", event => {
    if (event.operationType === "delete") {
        try {
            const { documentKey: { _id } } = event
            cloudinary.api.delete_resources(`Assignment/${_id}`)
        } catch (error) {
            console.error("Error handling change event:", error);
        }
    }
})

module.exports = router