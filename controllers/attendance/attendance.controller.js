const { default: mongoose } = require("mongoose")
const { Attendance } = require("../../models/attendance.model")
const { getTimeAndDate, converDateYYMMDD } = require("../../utils/auth.util")
const { attendanceCreateSchema, addAttendanceData } = require("./validation")
async function addAttendance(req, res) {
    try {
        await attendanceCreateSchema.validateAsync(req.body)
        //find attendance
        const isAttended = await Attendance.findOne({ ...req.body, course: { $all: [{ name: new mongoose.Types.ObjectId(req?.body?.course) }] }, teacherId: { $all: [new mongoose.Types.ObjectId(req?.body?.teacherId)] }, date: getTimeAndDate(), studentID: res.id })
        if (isAttended) return res.status(500).json({ message: "attendance already updated!" })
        const isAttended2 = await Attendance.findOne({ date: getTimeAndDate(), studentID: new mongoose.Types.ObjectId(res.id) })

        if (isAttended2) {
            await Attendance.updateMany(
                { _id: isAttended2._id },
                {
                    $push: {
                        course: { name: req?.body?.course, time: `${getTimeAndDate("time")}` },
                        teacherId: req?.body?.teacherId,
                    }
                }
            );
        } else {
            await Attendance.create({ ...req.body, course: [{ name: req?.body?.course, time: `${getTimeAndDate("time")}` }], teacherId: [req?.body?.teacherId], date: getTimeAndDate(), studentID: res.id, time: `${getTimeAndDate("time")}` })
        }

        return res.json({ message: "Attendance updated successfully" })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error?.message })
    }
}

async function attendanceList(req, res) {
    try {
        if ((!req.params.month || !req.params.year) && res.role !== "admin") {
            return res.status(500).json({ message: "Month and year are required as params values" });
        }

        let data = [];

        // Convert string dates to ISO date strings using moment.js
        var startDate = new Date(converDateYYMMDD(req.query.startDate));
        var endDate = new Date(converDateYYMMDD(req.query.endDate));

        const query = [
            ...(res.role !== "admin"
                ? [
                    {
                        $match: {
                            studentID: new mongoose.Types.ObjectId(res.id),
                        },
                    },
                ]
                : []),
            {
                $lookup: {
                    from: "users",
                    localField: "studentID",
                    foreignField: "_id",
                    as: "studentData",
                },
            },
            {
                $unwind: "$studentData",
            },
            {
                $lookup: {
                    from: "courses",
                    foreignField: "_id",
                    localField: "course.name",
                    as: "courses",
                },
            },

            // { $unwind: "$courses" },
            ...(res.role !== "admin"
                ? [
                    {
                        $addFields: {
                            month: { $month: { $dateFromString: { dateString: "$date", format: "%d/%m/%Y" } } },
                            year: { $year: { $dateFromString: { dateString: "$date", format: "%d/%m/%Y" } } },
                        },
                    },
                    {
                        $match: {
                            month: parseInt(req.params.month),
                            year: parseInt(req.params.year),
                        },
                    },
                ]
                : [
                    {
                        $match: {
                            timeStamp: {
                                $gte: startDate,
                                $lte: endDate,
                            },
                        },
                    },
                ]),
            {
                $addFields: {
                    courses: {
                        $map: {
                            input: "$courses",
                            as: "course5",
                            in: {
                                name: "$$course5.name",
                                time: { $first: "$course.time" }, // Take the first element of the time array
                            },
                        },
                    },
                },
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$studentData.name" },
                    date: { $first: "$date" },
                    time: { $first: "$time" },
                    isPresent: { $first: "$isPresent" },
                    courses: {
                        $push: "$courses",
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    date: 1,
                    time: 1,
                    isPresent: 1,
                    courses: {
                        $reduce: {
                            input: "$courses",
                            initialValue: [],
                            in: { $concatArrays: ["$$value", "$$this"] },
                        },
                    },
                },
            },
        ];

        if (res.role === "admin") {
            const attendanceResult = await Attendance.aggregate(query);
            data = attendanceResult;
        } else {
            data = await Attendance.aggregate(query);
        }

        return res.json(data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error?.message });
    }
}


const joinedList = async (req, res) => {
    try {
        //  console.log(getTimeAndDate())
        const data = await Attendance.aggregate([{
            $match: {
                date: getTimeAndDate(),
                teacherId: { $in: [new mongoose.Types.ObjectId(res.id)] }
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
            $project: {
                _id: 1,
                name: '$studentData.name',
                date: 1,
                time: 1,
            }
        }
        ])
        return res.json(data)
    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
}

//delete attendance
async function deleteAttendance(req, res) {
    try {
        const result = await Attendance.findOne({ _id: req.params.id })

        if (result.course.length > 1) {
            await Attendance.updateMany(
                { _id: result._id },
                {
                    $pull: {
                        course: { name: new mongoose.Types.ObjectId(req.query?.course) },
                        teacherId: new mongoose.Types.ObjectId(res.id),
                    }
                }
            );
        } else {
            await Attendance.findByIdAndDelete(req?.params?.id)
        }
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
        let data = await Attendance.find({ timeStamp: { $gte: lastDate, $lte: today }, teacherId: res.id }).populate("studentID", "name")
        return res.json(data)
    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
}
// const today = new Date();
// today.setHours(23, 59, 59, 999);
// console.log(today.toISOString())
module.exports = { addAttendance, attendanceList, joinedList, deleteAttendance, weeklyAttendance }