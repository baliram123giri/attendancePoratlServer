const { stateList } = require("../utils/data")

const router = require("express").Router()

router.get("/state/list", async (req, res) => {
    try {
        return res.json(stateList)
    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
})
module.exports = router