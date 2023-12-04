const express = require("express")
const app = express()
const session = require("express-session")
const cookieParser = require("cookie-parser")
const cors = require("cors")
require("dotenv").config()
//import db
require("./db/db")
const PORT = process.env.PORT || 4000
//middlewres
app.use(cookieParser())
app.use(cors({ credentials: true }))
app.use(express.json())
app.use(session({
    secret: "SeesionStore",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: false,
    }
}))

app.use("/api/v1/user", require("./routes/auth.routes"))
app.use("/api/v1/course", require("./routes/course.route"))
app.use("/api/v1/attendance", require("./routes/attendance.route"))
app.use("/api/v1/meeting", require("./routes/meeting.route"))
//not found err
app.use((req, res) => {
    res.status(404).json({ message: `${req.path} route not found` })
})
//create a server
app.listen(PORT, () => console.log(`server is running at ${PORT}`))