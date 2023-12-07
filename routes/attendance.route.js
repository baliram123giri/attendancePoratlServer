const { addAttendance, attendanceList, deleteAttendance } = require("../controllers/attendance/attendance.controller")
const { authorize } = require("../utils/auth.util")

const router = require("express").Router()

router.post(`/create`, authorize("student"), addAttendance)
router.get(`/list/:month/:year`, authorize("student"), attendanceList)
router.delete(`/delete/:id`, authorize("admin"), deleteAttendance)

module.exports = router