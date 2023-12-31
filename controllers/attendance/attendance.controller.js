const { default: mongoose } = require("mongoose")
const { Attendance } = require("../../models/attendance.model")
const { getTimeAndDate, converDateYYMMDD } = require("../../utils/auth.util")
const { attendanceCreateSchema, addAttendanceData } = require("./validation")
const { User } = require("../../models/user.model")
const moment = require('moment');
async function addAttendance(req, res) {
    try {
        await attendanceCreateSchema.validateAsync(req.body)
        //find attendance
        const isAttended = await Attendance.findOne({ ...req.body, date: getTimeAndDate(), studentID: res.id })
        if (isAttended) return res.status(500).json({ message: "attendance already updated!" })
        await Attendance.create({ ...req.body, date: getTimeAndDate(), studentID: res.id, time: `${getTimeAndDate("time")}` })
        return res.json({ message: "Attendance updated successfully" })

    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
}

async function attendanceList(req, res) {
    try {
        if ((!req.params.month || !req.params.year) && res.role !== "admin") return res.status(500).json({ message: "Month and year is required as params value" })
        let data = []
        // / Convert string dates to ISO date strings using moment.js
        var startDate = new Date(converDateYYMMDD(req.query.startDate));
        var endDate = new Date(converDateYYMMDD(req.query.endDate));

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
        //if request from students
        ...(res.role !== "admin" ? [{
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
        }] :
            //if request from admin
            [
                {
                    $match: {
                        timeStamp: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    }
                }
            ]),
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
            // const usersResult = await User.find({ role: "student" })
            const attendanceResult = await Attendance.aggregate(query)

            data = attendanceResult
        } else {
            data = await Attendance.aggregate(query)
        }
        return res.json(data)
    } catch (error) {
        console.log(error)
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

//get weekly attendanse
async function weeklyAttendance(req, res) {
    try {
        await addAttendanceData.validateAsync(req.body)
        const { lastDate, today } = req.body
        let data = await Attendance.find({ timeStamp: { $gte: lastDate, $lte: today } }).populate("studentID", "name")
        return res.json(data)
    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
}
// const today = new Date();
// today.setHours(23, 59, 59, 999);
// console.log(today.toISOString())
module.exports = { addAttendance, attendanceList, joinedList, deleteAttendance, weeklyAttendance }