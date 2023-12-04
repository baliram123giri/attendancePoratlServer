const Joi = require("joi")

const studentCreate = Joi.object({
    name: Joi.string().trim().required("name is required!"),
    email: Joi.string().trim().required("Email is required!").email().message("Invalid email"),
    mobile: Joi.string().min(10).max(10).required("Mobile is required!"),
    password: Joi.string().trim().required("Password is required!"),
    address: Joi.object({
        address: Joi.string().trim().required("Address is required!"),
        state: Joi.string().trim().required("State is required!"),
        city: Joi.string().trim().required("City is required!"),
        pincode: Joi.string().trim().required("Pincode is required!"),
    }).required("address is required!"),
})

const loginSchema = Joi.object({
    email: Joi.string().trim().required("Email is required!").email().message("Invalid email"),
    password: Joi.string().trim().required("Password is required!"),

})
module.exports = { studentCreate, loginSchema }
