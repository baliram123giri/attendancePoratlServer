const Joi = require("joi")

const attendanceCreateSchema = Joi.object({
    isPresent: Joi.boolean().required("isPresent required!"),
    course: Joi.string().trim().required("course is required!")
})

const addAttendanceData = Joi.object({
    lastDate: Joi.string().required("Last Date is required"),
    today: Joi.string().required("Today's Date is required"),
})

module.exports = { attendanceCreateSchema, addAttendanceData }
