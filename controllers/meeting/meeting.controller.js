const { default: mongoose } = require("mongoose")
const { Meeting } = require("../../models/meeting.model")
const { User } = require("../../models/user.model")
const { getTimeAndDate } = require("../../utils/auth.util")
const { sendEmail } = require("../../utils/sendEmail.utils")
const ejs = require("ejs")
const path = require("path")
const { Attendance } = require("../../models/attendance.model")
const { Course } = require("../../models/course.model")


async function createMeeting(req, res) {
    try {

        if (!req.body.link) return res.status(500).json({ message: "Link is required!" })
        const isLink = await Meeting.findOne({ date: getTimeAndDate(), userId: res.id })

        if (isLink) return res.status(500).json({ message: `Link is already created for ${getTimeAndDate()}` })

        // Set expiration time to 2 hours from now
        const expireInMinutes = 120;
        await Meeting.create({ ...req.body, userId: res.id, date: getTimeAndDate(), time: getTimeAndDate("time"), expireAt: new Date(Date.now() + expireInMinutes * 60 * 1000) })

        try {
            if (process.env.NODE_ENV !== "development") {
                const courseData = await Course.findById(req.body.course)
                const userdata = await User.find({ isActive: true }, { email: 1, name: 1, _id: 0 })
                const findTeacher = await User.findById(res.id)

                for (let i = 0; i < userdata.length; i++) {
                    if (userdata[i]._id !== new mongoose.Types.ObjectId(res.id)) {
                        const data = { name: userdata[i].name, date: new Date().toLocaleDateString(), course: courseData?.name || "NA", login: `${process.env.NODE_ENV === "development" ? "http://localhost:3000/login" : "https://app.bgtechub.com/login"}`, teacher: findTeacher.name }
                        await ejs.renderFile(path.join(__dirname, "../../mails/meeting-email.ejs"), data)
                        await sendEmail({
                            email: userdata[i].email,
                            subject: "Login To Join Live class ",
                            template: "meeting-email.ejs",
                            data
                        })
                    }
                }
            }

            //     // console.log(data)
            return res.json({ message: "Link Created Sucessfully" })

        } catch (error) {
            return res.status(500).json({ message: error?.message })
        }


    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
}

async function findMeetingsByToday(req, res) {
    try {
        const [data] = await Meeting.aggregate([{
            $match: {
                date: getTimeAndDate(),
                ...(res.role === "admin" ? { userId: new mongoose.Types.ObjectId(res.id) } : {})
            }
        },
        {
            $lookup: {
                from: "courses",
                foreignField: "_id",
                localField: "course",
                as: "courseData"
            }
        },
        {
            $unwind: "$courseData"
        },
        {
            $project: {
                date: 1,
                time: 1,
                link: 1,
                userId: 1,
                updatedAt: 1,
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
        return res.json(data)
    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
}

//delete meeting
const deletMeetingManualy = async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const meeting = await Meeting.findById(req.params.id)
        if (!meeting) res.status(404).json({ message: "Meeting not found" })
        const findAttendance = await Attendance.find({ date: getTimeAndDate(), teacherId: new mongoose.Types.ObjectId(res.id) })
        for (let i = 0; i < findAttendance.length; i++) {
            if (findAttendance[i].course.length > 1) {
                await Attendance.updateMany({ _id: findAttendance[i]._id }, { $pull: { course: { name: new mongoose.Types.ObjectId(meeting.course) }, teacherId: new mongoose.Types.ObjectId(res.id) } }, { session })
            } else {
                await Attendance.deleteMany({ date: getTimeAndDate() }, { session })
            }
        }

        await Meeting.findByIdAndDelete(req.params.id).session(session)
        await session.commitTransaction()
        return res.json({ message: "Meeting Deleted Successfully..." })

    } catch (error) {
        await session.abortTransaction()
        return res.status(500).json({ message: error?.message })
    }
}
module.exports = { createMeeting, findMeetingsByToday, deletMeetingManualy }
