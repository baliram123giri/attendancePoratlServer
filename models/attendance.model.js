const mongoose = require("mongoose")

const AttendanceSchema = new mongoose.Schema({
    studentID: { type: mongoose.Schema.ObjectId, ref: "User" },
    date: String,
    isPresent: Boolean,
    time: {
        type: String
    },
    timeStamp: {
        type: Date,
        default: Date.now()
    },
    course: { type: mongoose.Schema.ObjectId, ref: "Course" }
})


const Attendance = mongoose.model("Attendance", AttendanceSchema)

module.exports = { Attendance }