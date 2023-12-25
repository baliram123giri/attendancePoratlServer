
const cookieParser = require("cookie-parser")
const cors = require("cors")
const { server, app, express, connectDb } = require("./db/db")
require("dotenv").config()

connectDb()

const PORT = process.env.PORT || 4000
//middlewres
app.use(cookieParser())
app.use(cors({ origin: true, credentials: true, }))
app.use(express.json())


app.use("/api/v1/user", require("./routes/auth.routes"))
app.use("/api/v1/course", require("./routes/course.route"))
app.use("/api/v1/attendance", require("./routes/attendance.route"))
app.use("/api/v1/meeting", require("./routes/meeting.route"))
app.use("/api/v1/users", require("./routes/users.route"))
app.use("/api/v1/chats", require("./routes/chatRoutes"))
app.use("/api/v1/messages", require("./routes/messageRoutes"))
app.use("/api/v1/assignment", require("./routes/assignments.route"))
app.use("/api/v1/data", require("./routes/data.route"))

//not found err
app.use((req, res) => {
    res.status(404).json({ message: `${req.path} route not found` })
})
//create a server
server.listen(PORT, () => console.log(`server is running at ${PORT}`))
