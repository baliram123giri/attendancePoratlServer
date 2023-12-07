const Joi = require("joi")

const attendanceCreateSchema = Joi.object({
    isPresent: Joi.boolean().required("isPresent required!"),
    course: Joi.string().trim().required("course is required!")
})

module.exports = { attendanceCreateSchema }
