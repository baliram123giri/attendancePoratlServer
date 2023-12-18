const { ChatModel } = require("../../models/chat.model")
const { MessageModel } = require("../../models/message.model")

//create
const createMessage = async (req, res) => {
    try {
        const { chatId, text, senderId, receiverId } = req.body
        const message = new MessageModel({ chatId, text, senderId, receiverId })
        const response = await message.save()
        return res.json(response)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

const getMessage = async (req, res) => {
    try {
        const { chatId } = req.params
        const response = await MessageModel.find({ chatId })
        return res.json(response)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

//update message
const updateMessage = async (req, res) => {
    try {
        const { chatId } = req.params
        const response = await MessageModel.updateMany({ isRead: false, chatId }, { $set: { isRead: true } })
        return res.json(response)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

//delete message
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params
        const response = await MessageModel.deleteOne({ _id: id })
        return res.json(response)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

//get user notifications
const getNotification = async (req, res) => {
    try {
        const response = await MessageModel.find({ receiverId: req.params.userId, isRead: false }).populate("senderId", ["name"]).sort({ createdAt: -1 })
        return res.json(response)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = { createMessage, getMessage, updateMessage, getNotification, deleteMessage }