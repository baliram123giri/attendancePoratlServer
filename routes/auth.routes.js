const { createStudent, loginStudent, activateAccount } = require("../controllers/auth/auth.controller")

const router = require("express").Router()

router.post("/register", createStudent)
router.post("/activate", activateAccount)
router.post("/login", loginStudent)

module.exports = router