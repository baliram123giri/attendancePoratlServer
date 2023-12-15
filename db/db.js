const { default: mongoose } = require("mongoose");
const { User } = require("../models/user.model");
const { ChatModel } = require("../models/chat.model");
const express = require("express")
const app = express()
const http = require('http');
const socketIO = require('socket.io');
const { findMeetingsByToday } = require("../controllers/meeting/meeting.controller");
const { joinedList } = require("../controllers/attendance/attendance.controller");
const { MessageModel } = require("../models/message.model");

const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        credentials: true
    },
});

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




// Socket.io
io.on('connection', (socket) => {
    // Handle socket events here
    socket.on("allAttendance", async () => {
        const result = await joinedList()
        io.emit("allAttendance", result)
    })

    //create a meeting link 
    socket.on("meeting", async () => {
        const result = await findMeetingsByToday()
        io.emit("meeting", result)
    })

    //users list
    socket.on("findUsers", () => {

    })
    //Delete User
    socket.on("deleteUser", () => {

    })
    //chat insert
    socket.on("addChat", () => {

    })

    //getMessage
    socket.on("getMessage", () => {

    })

    socket.on('disconnect', () => {

    });
});




User.watch().on("change", (event) => {
    if (event.operationType === "insert") {
        const { _id, name, email } = event.fullDocument
        io.emit("findUsers", { _id, name, email })
    }
    if (event.operationType === "delete") {
        const { _id } = event?.documentKey
        io.emit("deleteUser", String(_id))
    }
})

//chat module
ChatModel.watch().on("change", (event) => {
    if (event.operationType === "insert") {
        try {
            //send to the client
            io.emit("getMessage", event.fullDocument);
        } catch (error) {
            console.error("Error handling change event:", error);
        }
    }
});

//message model
MessageModel.watch().on("change", (event) => {
    if (event.operationType === "insert") {
        try {
            //send to the client
            io.emit("getMessage", event?.fullDocument);
        } catch (error) {
            console.error("Error handling change event:", error);
        }
    }
})

module.exports = { connectDb, server, app, express }