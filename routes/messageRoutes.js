const { createMessage, getMessage } = require("../controllers/message/message.controller")


const router = require("express").Router()

router.post("/", createMessage)
router.get("/:chatId", getMessage)


module.exports = router