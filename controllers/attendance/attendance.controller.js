const { Attendance } = require("../../models/attendance.model")
const { attendanceCreateSchema } = require("./validation")

async function addAttendance(req, res) {
    try {
        await attendanceCreateSchema.validateAsync(req.body)
        //find attendance
        const isAttended = await Attendance.findOne({ ...req.body, studentID: res.id })
        if (isAttended) return res.status(500).json({ message: "attendance already updated!" })

        await Attendance.create({ ...req.body, studentID: res.id, time: `${new Date().toLocaleTimeString()}` })
        return res.json({ message: "Attendance updated successfully" })

    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
}

async function attendanceList(req, res) {
    try {
        let data = []

        const query = [{
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
module.exports = { addAttendance, attendanceList, joinedList }