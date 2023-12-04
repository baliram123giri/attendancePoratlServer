const { default: mongoose } = require("mongoose");

function connectDb() {
    mongoose.connect(`${process.env.DB_URL}`).then(() => {
        console.log("Connection Successfull")
    }).catch((error) => {
        console.log(error)
        setTimeout(() => {
            connectDb()
        }, 5000)
    })
}
connectDb()