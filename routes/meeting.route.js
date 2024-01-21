const router = require("express").Router()
const { joinedList } = require("../controllers/attendance/attendance.controller")
const { createMeeting, deletMeetingManualy, findMeetingsByToday } = require("../controllers/meeting/meeting.controller")
const { Attendance } = require("../models/attendance.model")
const { authorize } = require("../utils/auth.util")

//create
router.post(`/create`, authorize("admin"), createMeeting)
router.get(`/list`, authorize("admin", "student"), findMeetingsByToday)
router.get(`/joined/list`, authorize("admin"), joinedList)
//delete  meeting
router.delete(`/delete/:id`, authorize("admin"), deletMeetingManualy)
router.put("/updatemany", async (req, res) => {
    try {
        const attendance = await Attendance.find()
        for (let i = 0; i < attendance.length; i++) {
            await Attendance.updateMany({ _id: attendance[i]._id }, { $set: { course: [{ name: "65659f1cd2961915c029760c", time: attendance[i]?.time }], teacherId: ["658c4bc66c351bfe8066e42b"] } })
        }

        return res.json("success")
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

module.exports = router