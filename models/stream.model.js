const mongoose = require("mongoose")

const StreamSchema = new mongoose.Schema({
    name: String
})

const StreamModel = mongoose.model("Stream", StreamSchema)

module.exports = { StreamModel }