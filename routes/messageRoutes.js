const multer = require("multer");
const { createMessage, getMessage, updateMessage, getNotification, deleteMessage } = require("../controllers/message/message.controller");
const { MessageModel } = require("../models/message.model");
const { generateRandomId } = require("../utils/auth.util");
const cloudinary = require('cloudinary').v2;

const router = require("express").Router()
// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLODINARY_NAME,
    api_key: process.env.CLODINARY_KEY,
    api_secret: process.env.CLODINARY_SECRET,
});

// Configure Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post("/", upload.single('docs'), async (req, res) => {
    try {
        const { chatId, text, senderId, receiverId } = req.body
        await MessageModel.collection.dropIndex("createdAt_1")
        await MessageModel.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 })
        const publicId = `${String(generateRandomId())}`;

        if (req.file) {
            //upload docs

            cloudinary.uploader.upload_stream({
                resource_type: "auto",
                public_id: publicId,
                transformation: {
                    quality: "auto:low"
                }
            }, async (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Error uploading to Cloudinary', err });
                } else {
                    const finalResult = await MessageModel.create({ _id: publicId, chatId, text, senderId, receiverId, docs: result.url, createdAt: new Date() })
                    return res.json(finalResult)
                }
            }).end(req.file.buffer)
        } else {
            const response = await MessageModel.create({ _id: publicId, chatId, text, senderId, receiverId, createdAt: new Date() })
            return res.json(response)
        }

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
})

router.get("/:chatId", getMessage)
router.put("/update/:chatId", updateMessage)
router.delete("/delete/:id", deleteMessage)
router.get("/notifications/:userId", getNotification)

MessageModel.watch().on("change", async (event) => {
    if (event.operationType === "delete") {
        try {
            const { documentKey: { _id } } = event
            cloudinary.api.delete_resources(String(_id), () => {
                console.log(_id, "deleted")
            })
        } catch (error) {
            console.error("Error handling change event:", error);
        }
    }
})

module.exports = router