const mongoose = require("mongoose")

const AssigmentsSchema = new mongoose.Schema({
    title: String,
    userId: { type: mongoose.Schema.ObjectId, ref: "User" },
    gitUrl: String,
    netlifyUrl: String,
    thumbnail: String,
}, { timestamps: true })


const Assignments = mongoose.model("Assignment", AssigmentsSchema)

module.exports = { Assignments }