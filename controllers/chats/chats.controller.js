const { ChatModel } = require("../../models/chat.model")
const { MessageModel } = require("../../models/message.model")

const createChat = async (req, res) => {
    try {
        const { firstId, secondId } = req.body

        const chat = await ChatModel.findOne({
            members: { $all: [firstId, secondId] }
        })

        if (chat) return res.json(chat)

        const newChat = new ChatModel({
            members: [firstId, secondId]
        })
        const response = await newChat.save()
        return res.json(response)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

//find members chat

const findusersChat = async (req, res) => {
    try {
        const userId = req.params.id
        const chat = await ChatModel.find({
            members: { $in: [userId] }
        })
        return res.json(chat)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

//find chat one
const findChat = async (req, res) => {
    try {
        const { firstId, secondId } = req.params

        const chat = await ChatModel.findOne({
            members: { $all: [firstId, secondId] }
        })
        return res.json(chat)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

//delete chat user
async function clearChat(req, res) {
    try {
        const { chatId } = req.params
        const clearChat = req.query?.clear
        const chat = await ChatModel.findById(chatId)
        if (!chat) return res.status(404).json({ message: "Chat not found" })

        //found
        if (!clearChat) {
            await ChatModel.findByIdAndDelete(chatId)
        }
        await MessageModel.deleteMany({ chatId })
        return res.json({ message: "Chat deleted successfully..." })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
module.exports = { createChat, findusersChat, findChat, clearChat }