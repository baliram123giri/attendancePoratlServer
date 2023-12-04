const Joi = require("joi")

const attendanceCreateSchema = Joi.object({
    date: Joi.string().trim().required("date is required!"),
    // time: Joi.string().trim().required("time is required!"),
    isPresent: Joi.boolean().required("isPresent required!"),
    course: Joi.string().trim().required("course is required!")
})

module.exports = { attendanceCreateSchema }
