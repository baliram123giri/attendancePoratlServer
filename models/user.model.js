const mongoose = require("mongoose")

const addressSchema = new mongoose.Schema({
    address: String,
    state: String,
    city: String,
    pincode: Number
})


//create a schema 
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: Number,
    password: String,
    address: { type: mongoose.Schema.ObjectId, ref: "Address" },
    avatar: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        default: "student"
    },
    gender: String,
    stream: String,
    dob: String
})

const User = mongoose.model("User", UserSchema)
const Address = mongoose.model("Address", addressSchema)

module.exports = { User, Address }