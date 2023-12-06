const router = require("express").Router()
const { createMeeting } = require("../controllers/meeting/meeting.controller")
const { authorize } = require("../utils/auth.util")
router.post(`/create`, authorize("admin"), createMeeting)
module.exports = router