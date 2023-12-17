const { createMessage, getMessage , updateMessage} = require("../controllers/message/message.controller")


const router = require("express").Router()

router.post("/", createMessage)
router.get("/:chatId", getMessage)
router.put("/update/:chatId", updateMessage)


module.exports = router