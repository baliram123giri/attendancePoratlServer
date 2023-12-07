const { default: mongoose } = require("mongoose")
const { Attendance } = require("../../models/attendance.model")
const { getTimeAndDate } = require("../../utils/auth.util")
const { attendanceCreateSchema } = require("./validation")

async function addAttendance(req, res) {
    try {
        await attendanceCreateSchema.validateAsync(req.body)
        //find attendance
        const isAttended = await Attendance.findOne({ ...req.body, studentID: res.id })
        if (isAttended) return res.status(500).json({ message: "attendance already updated!" })
        await Attendance.create({ ...req.body, date: getTimeAndDate(), studentID: res.id, time: `${getTimeAndDate("time")}` })
        return res.json({ message: "Attendance updated successfully" })

    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
}

async function attendanceList(req, res) {
    try {
        if (!req.params.month || !req.params.year) return res.status(500).json({ message: "Month and year is required as params value" })
        let data = []

        const query = [...(res.role !== "admin" ? [{
            $match: {
                studentID: new mongoose.Types.ObjectId(res.id)
            }
        }] : []), {
            $lookup: {
                from: "users",
                localField: "studentID",
                foreignField: "_id",
                as: "studentData"
            },

        },
        {
            $unwind: "$studentData"
        },
        {
            $lookup: {
                from: "courses",
                foreignField: "_id",
                localField: "course",
                as: "courseData"
            }
        },
        { $unwind: "$courseData" },
        {
            $addFields: {
                month: { $month: { $dateFromString: { dateString: "$date", format: "%d/%m/%Y" } } },
                year: { $year: { $dateFromString: { dateString: "$date", format: "%d/%m/%Y" } } },
            }
        },
        {
            $match: {
                month: parseInt(req.params.month),
                year: parseInt(req.params.year)
            }
        },
        {
            $project: {
                _id: 1,
                name: '$studentData.name',
                date: 1,
                time: 1,
                isPresent: 1,
                course: "$courseData.name"
            }
        }
        ]
        if (res.role === "admin") {
            data = await Attendance.aggregate(query)
        } else {
            data = await Attendance.aggregate(query)
        }
        return res.json(data)
    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
}

const joinedList = async () => {
    try {
        const data = await Attendance.aggregate([{
            $match: {
                date: getTimeAndDate(),
            }
        }, {
            $lookup: {
                from: "users",
                localField: "studentID",
                foreignField: "_id",
                as: "studentData"
            },

        },
        {
            $unwind: "$studentData"
        },
        {
            $lookup: {
                from: "courses",
                foreignField: "_id",
                localField: "course",
                as: "courseData"
            }
        },
        { $unwind: "$courseData" },
        {
            $project: {
                _id: 1,
                name: '$studentData.name',
                date: 1,
                time: 1,
                course: "$courseData.name"
            }
        }
        ])
        return data
    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
}

//delete attendance
async function deleteAttendance(req, res) {
    try {
        await Attendance.findByIdAndDelete(req?.params?.id)
        return res.json({ message: "Attendance deleted successfully" })
    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
}
module.exports = { addAttendance, attendanceList, joinedList, deleteAttendance }