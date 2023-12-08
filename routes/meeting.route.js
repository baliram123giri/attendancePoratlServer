const router = require("express").Router()
const { createMeeting, deletMeetingManualy } = require("../controllers/meeting/meeting.controller")
const { authorize } = require("../utils/auth.util")

//create
router.post(`/create`, authorize("admin"), createMeeting)
//delete  meeting
router.delete(`/delete/:id`, authorize("admin"), deletMeetingManualy)
module.exports = router