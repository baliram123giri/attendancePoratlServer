const mongoose = require("mongoose")
const MessageSchema = new mongoose.Schema({
    chatId: String,
    senderId: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    receiverId: String,
    text: String,
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const MessageModel = mongoose.model("Message", MessageSchema)

module.exports = { MessageModel }