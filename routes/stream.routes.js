const { CreateStream, ListStream, GetSingleStream, DeleteStream, UpdateStream } = require("../controllers/stream/stream.controller")
const { authorize } = require("../utils/auth.util")

const router = require("express").Router()

router.post("/create", authorize("student", "admin"), CreateStream)
router.get("/list", ListStream)
router.get("/:id", GetSingleStream)
router.delete("/delete/:id", authorize("admin"), DeleteStream)
router.put("/update/:id", authorize("student", "admin"), UpdateStream)



module.exports = router