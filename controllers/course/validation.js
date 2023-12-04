const Joi = require("joi")

const courseCreateSchema = Joi.object({
    name: Joi.string().trim().required("name is required!"),
})

module.exports = { courseCreateSchema }
