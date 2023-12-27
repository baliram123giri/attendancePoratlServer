const multer = require('multer');
const { usersList, deleteUser, friendsList, findUser, changePassword,  forgetpassword } = require('../controllers/auth/auth.controller')
const { User, Address } = require('../models/user.model')
const { authorize, setAccessTokenCookie } = require('../utils/auth.util');
const { verify } = require('jsonwebtoken');
const { hashSync, hash } = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const router = require('express').Router()


// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLODINARY_NAME,
    api_key: process.env.CLODINARY_KEY,
    api_secret: process.env.CLODINARY_SECRET,
});
// Configure Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.get('/list', usersList)
router.get('/friends/list', friendsList)
router.get('/find/:id', findUser)
router.delete('/delete/:id', authorize("admin"), deleteUser)
router.get('/logout', authorize("admin", "student"), (req, res) => {
    try {
        setAccessTokenCookie(res, "", 1)
        return res.json({ message: "logout successfully..." })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

router.put("/update/account/info", authorize("admin", "student"), upload.single('avatar'), async (req, res) => {
    try {
        const user = await User.findById(res.id)
        if (!user) return res.status(500).json({ message: "User not found" });

        if (req.file) {

            cloudinary.uploader.upload_stream({
                folder: "Profile",
                public_id: `${user._id}`,
                transformation: [{
                    gravity: "face",
                    height: 300,
                    width: 300,
                    crop: "fill",
                    radius: "max"
                }]
            }, async (err, result) => {
                if (err) {
                    return res.status(500).json({ message: "File Upload Error...", err })
                } else {
                    const data = await User.findByIdAndUpdate(res.id, { ...req.body, avatar: result.url }, { new: true }).populate("address").select("-password")
                    return res.json({ message: "Account Information Updated Successfully...", data })
                }
            }).end(req.file.buffer)
        } else {
            //if not file
            if (req?.body?.address) {
                //if address
                let data;
                if (!user?.address) {
                    const address = await Address.create(req.body)
                    data = address
                    await User.findByIdAndUpdate(res.id, { address: address._id })
                } else {
                    data = await Address.findByIdAndUpdate(user.address, req.body, { new: true })
                }

                return res.json({ message: "Address Updated Successfully...", data })
            } else {
                const data = await User.findByIdAndUpdate(res.id, req.body, { new: true }).populate("address").select("-password")
                return res.json({ message: "Account Information Updated Successfully...", data })
            }
        }

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

router.put("/change/password", authorize("admin", "student"), changePassword)
router.put("/changepassword", async (req, res) => {
    try {
        const token = verify(req.body.token, process.env.JWT_SECRET)
        if (!token) return res.status(500).json({ message: "Invalid or expire Token" })
        const user = await User.findById(token?.id)
        if (!user) return res.status(404).json({ message: "User not found" })
        const password = await hash(req.body.password, 10)
        await User.findByIdAndUpdate(user._id, { password })
        return res.json({ message: "Password Change Successfully..." })

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

router.post("/forgetpassword", forgetpassword)

//delete images
User.watch().on("change", event => {
    if (event.operationType === "delete") {
        try {
            const { documentKey: { _id } } = event
            cloudinary.api.delete_resources(`Profile/${_id}`)
        } catch (error) {
            console.error("Error handling change event:", error);
        }
    }
})

module.exports = router