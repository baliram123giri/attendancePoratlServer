const express = require("express")
const app = express()
const session = require("express-session")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const http = require('http');
const socketIO = require('socket.io');
const { Attendance } = require("./models/attendance.model")
require("dotenv").config()
//import db
require("./db/db")
const PORT = process.env.PORT || 4000
//middlewres
app.use(cookieParser())
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

const server = http.createServer(app);
const io = socketIO(server);
// Set io on the app to make it accessible in the routes
app.set('io', io);
// Socket.io
io.on('connection', (socket) => {
    console.log('A user connected');

    // Send all attendance records to the newly connected client
    sendAllAttendanceToClient(socket);

    // Handle socket events here

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Function to send all attendance records to a specific client
const sendAllAttendanceToClient = async (socket) => {
    try {
        const allAttendance = await Attendance.find();
        socket.emit('allAttendance', { attendance: allAttendance });
    } catch (error) {
        console.error('Error sending attendance data to client:', error);
    }
};

app.use("/api/v1/user", require("./routes/auth.routes"))
app.use("/api/v1/course", require("./routes/course.route"))
app.use("/api/v1/attendance", require("./routes/attendance.route"))
app.use("/api/v1/meeting", require("./routes/meeting.route"))
//not found err
app.use((req, res) => {
    res.status(404).json({ message: `${req.path} route not found` })
})
//create a server
server.listen(PORT, () => console.log(`server is running at ${PORT}`))