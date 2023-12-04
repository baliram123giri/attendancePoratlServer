const { addAttendance, attendanceList, joinedList } = require("../controllers/attendance/attendance.controller")
const { authSign } = require("../utils/auth.util")

const router = require("express").Router()

router.post(`/create`, authSign, addAttendance)
router.get(`/list`, authSign, attendanceList)
router.get(`/joined/list`, authSign, joinedList)

module.exports = router