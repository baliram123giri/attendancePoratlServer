const { addAttendance, attendanceList, deleteAttendance, weeklyAttendance, joinedList } = require("../controllers/attendance/attendance.controller")
const { authorize } = require("../utils/auth.util")

const router = require("express").Router()

router.post(`/create`, authorize("student"), addAttendance)
router.get(`/list/:month?/:year?`, authorize("student", "admin"), attendanceList)
router.post(`/list/weekly`, authorize("admin"), weeklyAttendance)
router.delete(`/delete/:id`, authorize("admin"), deleteAttendance)
router.get(`/joined/list`, authorize("admin"), joinedList)

module.exports = router