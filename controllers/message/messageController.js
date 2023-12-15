const { MessageModel } = require("../../models/message.model")

//create
const createMessage = async (req, res) => {
    try {
        const { chatId, text, senderId } = req.body
        const message = new MessageModel({ chatId, text, senderId })
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

module.exports = { createMessage, getMessage }