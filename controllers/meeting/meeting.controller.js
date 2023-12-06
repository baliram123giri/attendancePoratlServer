const { Meeting } = require("../../models/meeting.model")
const { User } = require("../../models/user.model")
const { sendEmail } = require("../../utils/sendEmail.utils")
const ejs = require("ejs")
const path = require("path")


async function createMeeting(req, res) {
    try {
        if (!req.body.link) return res.status(500).json({ message: "Link is required!" })
        const isLink = await Meeting.findOne({ link: req.body.link })

        if (isLink) return res.json({ message: "Link is already created" })

        await Meeting.create({ ...req.body, expireAt: new Date(Date.now() + 4 * 60 * 60 * 1000) })
        // const userdata = await User.find({ role: "student" }, { email: 1, name: 1, _id: 0 })

        return res.json({ message: "Link Created Sucessfully" })
        // try {

        //     for (let i = 0; i < userdata.length; i++) {
        //         const data = { name: userdata[i].name }
        //         await ejs.renderFile(path.join(__dirname, "../../mails/meeting-email.ejs"), data)
        //         await sendEmail({
        //             email: userdata[i].email,
        //             subject: "Join Live class",
        //             template: "meeting-email.ejs",
        //             data
        //         })
        //     }

        //     // console.log(data)
        //     res.json({ message: "Link Created Sucessfully" })

        // } catch (error) {
        //     res.status(500).json({ message: error?.message })
        // }


    } catch (error) {
        res.status(500).json({ message: error?.message })
    }
}

module.exports = { createMeeting }