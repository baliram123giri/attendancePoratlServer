const { createCourse, courseList } = require("../controllers/course/course.controller")
const { authorize } = require("../utils/auth.util")

const router = require("express").Router()

router.post(`/create`, authorize("admin"), createCourse)
router.get(`/list`, courseList)

module.exports = router