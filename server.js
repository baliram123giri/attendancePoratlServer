const express = require("express")
const app = express()
const session = require("express-session")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const http = require('http');
const socketIO = require('socket.io');
const { Attendance } = require("./models/attendance.model")
const { joinedList } = require("./controllers/attendance/attendance.controller")
require("dotenv").config()
//import db
require("./db/db")
const PORT = process.env.PORT || 4000
//middlewres
app.use(cookieParser())
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        credentials: true
    },
});
// Set io on the app to make it accessible in the routes
app.set('io', io);
// Socket.io
io.on('connection', (socket) => {
    // console.log('A user connected');
    // Handle socket events here
    socket.on("allAttendance", async (data) => {
        const result = await joinedList()
        io.emit("allAttendance", result)
    })
    socket.on('disconnect', () => {

    });
});


app.use("/api/v1/user", require("./routes/auth.routes"))
app.use("/api/v1/course", require("./routes/course.route"))
app.use("/api/v1/attendance", require("./routes/attendance.route"))
app.use("/api/v1/meeting", require("./routes/meeting.route"))
app.use("/api/v1/users", require("./routes/users.route"))
//not found err
app.use((req, res) => {
    res.status(404).json({ message: `${req.path} route not found` })
})
//create a server
server.listen(PORT, () => console.log(`server is running at ${PORT}`))