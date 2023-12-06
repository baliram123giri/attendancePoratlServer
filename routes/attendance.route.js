const { addAttendance, attendanceList, joinedList } = require("../controllers/attendance/attendance.controller")
const { authSign, authorize } = require("../utils/auth.util")

const router = require("express").Router()

router.post(`/create`, authorize("student"), addAttendance)
router.get(`/list`, authorize("student"), attendanceList)

module.exports = router