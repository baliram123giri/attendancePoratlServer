const { createMessage, getMessage, updateMessage, getNotification } = require("../controllers/message/message.controller")


const router = require("express").Router()

router.post("/", createMessage)
router.get("/:chatId", getMessage)
router.put("/update/:chatId", updateMessage)
router.get("/notifications/:userId", getNotification)

module.exports = router