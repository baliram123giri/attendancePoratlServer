const { Course } = require("../../models/course.model")
const { courseCreateSchema } = require("./validation")

async function createCourse(req, res) {
    try {
        await courseCreateSchema.validateAsync(req.body)
        //check course exist or not
        const isCourse = await Course.findOne({ name: req.body.name }) 

        if (isCourse) return res.status(400).json({ message: `${req.body.name} with this name course already exist!` })

        await Course.create(req.body)
        res.json({ message: "Course created successfully" })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

//course list
async function courseList(req, res) {
    try {
        const data = await Course.find()
        return res.json(data)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
module.exports = { createCourse, courseList }