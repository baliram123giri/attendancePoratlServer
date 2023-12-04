const mongoose = require("mongoose")

const MeetingSchema = new mongoose.Schema({
    link: {
        type: String
    },
    course: { type: mongoose.Schema.ObjectId, ref: "Course", required: true },
    expireAt: { type: Date, default: Date.now, expires: 4 * 60 * 60 } // TTL index for expireAt field (expires in 10 seconds)
}, { timestamps: true })

const Meeting = mongoose.model("Meeting", MeetingSchema)

module.exports = { Meeting }