const Joi = require("joi")

const createStreamValidation = Joi.object({
    name: Joi.string().trim().required("Stream name is required")
})

module.exports = { createStreamValidation }