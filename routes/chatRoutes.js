const { createChat, findusersChat, findChat, clearChat } = require("../controllers/chats/chats.controller")

const router = require("express").Router()

router.post("/", createChat)
router.get("/:id", findusersChat)
router.get("/find/:firstId/:secondId", findChat)    
router.delete("/clear/:chatId", clearChat)


module.exports = router