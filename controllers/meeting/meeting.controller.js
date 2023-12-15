const { default: mongoose } = require("mongoose")
const { Meeting } = require("../../models/meeting.model")
const { User } = require("../../models/user.model")
const { getTimeAndDate } = require("../../utils/auth.util")
const { sendEmail } = require("../../utils/sendEmail.utils")
const ejs = require("ejs")
const path = require("path")
const { Attendance } = require("../../models/attendance.model")


async function createMeeting(req, res) {
    try {

        if (!req.body.link) return res.status(500).json({ message: "Link is required!" })
        const isLink = await Meeting.findOne({ date: getTimeAndDate() })

        if (isLink) return res.status(500).json({ message: `Link is already created for ${getTimeAndDate()}` })

        // Set expiration time to 2 hours from now
        const expireInMinutes = 120;
        await Meeting.create({ ...req.body, date: getTimeAndDate(), time: getTimeAndDate("time"), expireAt: new Date(Date.now() + expireInMinutes * 60 * 1000) })
        // const userdata = await User.find({ role: "student" }, { email: 1, name: 1, _id: 0 })


        try {
            // for (let i = 0; i < userdata.length; i++) {
            //     const data = { name: userdata[i].name }
            //     await ejs.renderFile(path.join(__dirname, "../../mails/meeting-email.ejs"), data)
            //     await sendEmail({
            //         email: userdata[i].email,
            //         subject: "Join Live class",
            //         template: "meeting-email.ejs",
            //         data
            //     })
            // }

        //     // console.log(data)
        return res.json({ message: "Link Created Sucessfully" })

        } catch (error) {
            res.status(500).json({ message: error?.message })
        }
     

    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
}

async function findMeetingsByToday() {
    try {
        const data = await Meeting.aggregate([{
            $match: {
                date: getTimeAndDate()
            }
        },
        {
            $lookup: {
                from: "courses",
                foreignField: "_id",
                localField: "course",
                as: "courseData"
            }
        }, {
            $unwind: "$courseData"
        },
        {
            $project: {
                date: 1,
                time: 1,
                link: 1,
                course: {
                    name: "$courseData.name",
                    _id: "$courseData._id"
                }
            }
        },
        {
            $sort: {
                _id: -1 // Sort in descending order based on the "date" field
            }
        },
        {
            $limit: 1 // Limit to only the latest meeting
        }
        ]);
        return data
    } catch (error) {
        console.log(error.message);
        throw error;
    }
}

//delete meeting
const deletMeetingManualy = async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        await Attendance.deleteMany({ date: getTimeAndDate() }, { session })
        await Meeting.findByIdAndDelete(req.params.id).session(session)
        await session.commitTransaction()
        return res.json({ message: "Meeting Deleted Successfully..." })

    } catch (error) {
        await session.abortTransaction()
        return res.status(500).json({ message: error?.message })
    }
}
module.exports = { createMeeting, findMeetingsByToday, deletMeetingManualy }