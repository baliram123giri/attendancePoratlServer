const { createCourse, courseList } = require("../controllers/course/course.controller")
const { authSign, rolesAuth } = require("../utils/auth.util")

const router = require("express").Router()

router.post(`/create`, authSign, rolesAuth, createCourse)
router.get(`/list`, authSign, courseList)

module.exports = router