const mongoose = require("mongoose")
const MessageSchema = new mongoose.Schema({
    _id: String,
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
    },
    docs: {
        type: String,
        default: ""
    },
    docsName: String,
    createdAt: { type: Date, expires: 432000  }
})

const MessageModel = mongoose.model("Message", MessageSchema)

module.exports = { MessageModel }