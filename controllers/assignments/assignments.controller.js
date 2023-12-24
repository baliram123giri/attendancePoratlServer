const { Assignments } = require("../../models/assignment.mode")

const getAllAssignments = async (req, res) => {
    try {
        const pageNo = parseInt(req.query?.page) || 1
        const limit = req?.query?.limit || 10
        const totalItems = res.role === "admin" ? await Assignments.countDocuments() : await Assignments.countDocuments({ userId: res?.id })
        const totalPages = Math.ceil(totalItems / limit)
        const data = res.role === "admin" ? await Assignments.find().populate("userId", "name").skip((pageNo - 1) * limit).limit(limit).exec() : await Assignments.find({ userId: res?.id }).skip((pageNo - 1) * limit).limit(limit).exec()

        const metadata = {
            totalItems,
            totalPages,
            currentPage: pageNo,
            itemsPerPage: limit,
        };

        return res.json({ data, metadata })

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