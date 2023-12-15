const { createChat, findusersChat, findChat } = require("../controllers/chats/chats.controller")

const router = require("express").Router()

router.post("/", createChat)
router.get("/:id", findusersChat)
router.get("/find/:firstId/:secondId", findChat)


module.exports = router