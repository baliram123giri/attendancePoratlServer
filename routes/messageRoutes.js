const { createMessage, getMessage } = require("../Controllers/message/messageController")


const router = require("express").Router()

router.post("/", createMessage)
router.get("/:chatId", getMessage)


module.exports = router