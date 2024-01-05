const { CreateStream, ListStream, GetSingleStream, DeleteStream, UpdateStream } = require("../controllers/stream/stream.controller")

const router = require("express").Router()

router.post("/create", CreateStream)
router.get("/list", ListStream)
router.get("/:id", GetSingleStream)
router.delete("/delete/:id", DeleteStream)
router.put("/update/:id", UpdateStream)



module.exports = router