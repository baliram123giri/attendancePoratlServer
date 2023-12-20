const Joi = require("joi")

const assignmentCreateSchema = Joi.object({
    gitUrl: Joi.string().required("Github Url required!"),
    title: Joi.string().required("Title required!"),
    netlifyUrl: Joi.string().trim().required("Netlify Url required!"),
    tumbnail: Joi.any().required("Thumbnail required!"),
})

module.exports = { assignmentCreateSchema }
