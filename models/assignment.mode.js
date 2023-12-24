const mongoose = require("mongoose")

const AssigmentsSchema = new mongoose.Schema({
    _id: String,
    title: String,
    userId: { type: mongoose.Schema.ObjectId, ref: "User" },
    gitUrl: String,
    netlifyUrl: String,
    thumbnail: String,
    created: {
        type: Date,
        default: Date.now()
    }
})


const Assignments = mongoose.model("Assignment", AssigmentsSchema)

module.exports = { Assignments }