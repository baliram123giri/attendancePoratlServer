const mongoose = require("mongoose")
const ChatSchema = new mongoose.Schema({
    members: Array
}, {
    timestamps: true
})

const ChatModel = mongoose.model("Chat", ChatSchema)

module.exports = { ChatModel }