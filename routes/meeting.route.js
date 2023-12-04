const router = require("express").Router()
const { createMeeting } = require("../controllers/meeting/meeting.controller")
router.post(`/create`, createMeeting)
module.exports = router