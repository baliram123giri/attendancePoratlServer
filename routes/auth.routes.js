const { createStudent, loginStudent } = require("../controllers/auth/auth.controller")

const router = require("express").Router()

router.post("/register", createStudent)
router.post("/login", loginStudent)

module.exports = router