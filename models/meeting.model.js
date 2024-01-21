const mongoose = require("mongoose")

const MeetingSchema = new mongoose.Schema({
    link: {
        type: String
    },
    date: String,
    course: { type: mongoose.Schema.ObjectId, ref: "Course", required: true },
    time: String,
    userId:{ type: mongoose.Schema.ObjectId, ref: "User", required: true },
}, { timestamps: true })

const Meeting = mongoose.model("Meeting", MeetingSchema)

module.exports = { Meeting }