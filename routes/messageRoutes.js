const { createMessage, getMessage, updateMessage, getNotification, deleteMessage } = require("../controllers/message/message.controller")


const router = require("express").Router()

router.post("/", createMessage)
router.get("/:chatId", getMessage)
router.put("/update/:chatId", updateMessage)
router.delete("/delete/:id", deleteMessage)
router.get("/notifications/:userId", getNotification)

module.exports = router