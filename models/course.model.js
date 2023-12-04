const mongoose = require("mongoose")

const CourseSchema = new mongoose.Schema({
    name: String,
}, {
    timestamps: true
})

const Course = mongoose.model("Course", CourseSchema)

module.exports = { Course }