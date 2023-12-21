const { Assignments } = require("../../models/assignment.mode")

const getAllAssignments = async (req, res) => {
    try {

        const results = res.role === "admin" ? await Assignments.find() : await Assignments.find({ userId: res?.id })
        return res.json(results)

    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
}

//get single 
const getSingleAssignment = async (req, res) => {
    try {
        const results = await Assignments.findById(req.params?.id)
        return res.json(results)

    } catch (error) {
        return res.status(500).json({ message: error?.message })
    }
}




module.exports = { getAllAssignments, getSingleAssignment }