const mongoose = require("mongoose")

const StreamSchema = new mongoose.Schema({
    name: String,
    createdBy: { type: mongoose.Schema.ObjectId, ref: "User" }
})

const StreamModel = mongoose.model("Stream", StreamSchema)

module.exports = { StreamModel }