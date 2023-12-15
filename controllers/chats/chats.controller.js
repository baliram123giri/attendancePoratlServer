const { ChatModel } = require("../../models/chat.model")

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

module.exports = { createChat, findusersChat, findChat }