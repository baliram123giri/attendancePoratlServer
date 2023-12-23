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
const { Assignments } = require("../models/assignment.mode");
const cloudinary = require('cloudinary').v2;
// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLODINARY_NAME,
    api_key: process.env.CLODINARY_KEY,
    api_secret: process.env.CLODINARY_SECRET,
});

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




//online user
let OnlineUsers = []

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

    //DeleteMessage
    socket.on("deleteMessage", () => {

    })
    //getNotification
    socket.on("getNotification", () => {

    })

    //isMessageSeen 
    socket.on("messageSeen", () => {

    })


    //get online users
    socket.on("onlineUsers", (user) => {

        if (!OnlineUsers.some(({ userId }) => userId === user?._id)) {
            OnlineUsers.push({ socketId: socket.id, userId: user?._id })
            //send userId
            io.emit("onlineUsers", OnlineUsers)
        }
    })

    socket.on('disconnect', () => {
        OnlineUsers = OnlineUsers.filter(({ socketId }) => socketId !== socket.id)
        io.emit("onlineUsers", OnlineUsers)
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
            io.emit("addChat", event.fullDocument);
            io.emit("getMessage", event.fullDocument);
        } catch (error) {
            console.error("Error handling change event:", error);
        }
    }
});

//message model
MessageModel.watch().on("change", async (event) => {
    if (event.operationType === "insert") {
        try {
            //send to the client
            io.emit("getMessage", event?.fullDocument);
            //get notification
            const user = await User.find({ _id: event?.fullDocument?.senderId })
            io.emit("getNotification", { ...event?.fullDocument, senderId: { name: user[0].name, _id: user[0]._id } })
        } catch (error) {
            console.error("Error handling change event:", error);
        }
    }
    if (event.operationType === "update") {
        // console.log(event)
        const { documentKey: { _id } } = event
        io.emit("messageSeen", {
            _id,
            isRead: true,
            date: new Date()
        })
    }
})



module.exports = { connectDb, server, app, express }