const { default: mongoose } = require("mongoose");
const { User, Address } = require("../../models/user.model");
const { studentCreate, loginSchema, activateAccountSchema } = require("./validation");
const { hash, compareSync } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
    generateAccessToken,
    setAccessTokenCookie,
    getTimeDiff,
} = require("../../utils/auth.util");
const { Attendance } = require("../../models/attendance.model");
const { MessageModel } = require("../../models/message.model");
const { ChatModel } = require("../../models/chat.model");
const { Assignments } = require("../../models/assignment.mode");
const { sendEmail } = require("../../utils/sendEmail.utils");
const ejs = require("ejs")
const path = require("path")
//create user
async function createStudent(req, res) {

    try {
        await studentCreate.validateAsync(req.body);
        const { address, ...rest } = req.body;

        //if user email found through error
        const user = await User.findOne({ email: rest.email });
        if (user)
            return res.status(501).json({ message: "User email alreay exist!" });

        //if not  create a user but before that create user address and track in dtl => data transaction language

        //now add user
        //hash password
        const password = await hash(rest.password, 10);
        const token = jwt.sign({ ...rest, password }, process.env.JWT_SECRET, { expiresIn: "24h" })
        const data = { token: `${process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://app.bgtechub.com"}/activate/${token}`, name: rest.name }
        await ejs.renderFile(path.join(__dirname, "../../mails/activation.ejs"), data)
        await sendEmail({
            email: rest.email,
            subject: `🚀 Activate Your Account Now for Exclusive Benefits!`,
            template: "activation.ejs",
            data
        })
        //send response
        return res.json({ message: `Account activation link has been sent to ${req.body.email}` });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//activate account
async function activateAccount(req, res) {
    try {
        await activateAccountSchema.validateAsync(req.body)
        const token = jwt.verify(req.body.token, process.env.JWT_SECRET)
        if (!token) return res.status(501).json({ message: "Invalid Token!" });
        const { iat, exp, ...rest } = token
        const user = await User.findOne(rest)
        if (user) return res.status(200).json({ message: "Account Already Activated" });
        await User.create(rest)
        return res.json({ message: "Account Activated Successfully" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
async function loginStudent(req, res) {
    try {
        await loginSchema.validateAsync(req.body);
        const { email, password } = req.body;
        const user = await User.findOne({ email })
            .select("-__v")
            .populate("address");

        if (!user)
            return res.status(500).json({ message: "Email or password wrong" });

        //if found start dehashing
        const isValid = compareSync(password, user.password);
        if (!isValid)
            return res.status(500).json({ message: "Email or password wrong" });
        if (!user.isActive) {
            return res.status(500).json({ message: "Your account is InActive due to assignments, please contact to admin " });
        }
        const assignment = await Assignments.findOne({ userId: new mongoose.Types.ObjectId(user?._id) }).sort({ created: -1 })
        let checkUserValid = user
        if (assignment && (getTimeDiff(assignment?.created) > 15) && user?.softActive && user.role !== "admin") {
            checkUserValid = await User.findByIdAndUpdate({ _id: new mongoose.Types.ObjectId(user?._id) }, { isActive: false, softActive: false }, { new: true })
        }
        if ((!assignment || getTimeDiff(assignment.created) > 15) && !checkUserValid?.softActive && user.role !== "admin") {
            await User.findByIdAndUpdate({ _id: new mongoose.Types.ObjectId(user?._id) }, { isActive: false, softActive: false })
            return res.status(500).json({ message: "Your account is InActive due to assignments, please contact to admin" });
        }
        user.password = undefined;
        const token = generateAccessToken(user._doc);

        setAccessTokenCookie(res, token);

        return res.json({
            ...user._doc,
            ...(user?.role === "student" ? { inActiveTime: assignment ? getTimeDiff(assignment.created) : 15 } : {})
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//get users list
async function usersList(req, res) {
    try {
        const users = await User.aggregate([
            {
                $match: {
                    role: "student"
                }
            },
            {
                $lookup: {
                    foreignField: "_id",
                    from: "addresses",
                    localField: "address",
                    as: "addressData",
                },
            },
            {
                $unwind: {
                    path: "$addressData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    password: 0,
                    __v: 0,
                }
            }
        ]);
        return res.json(users);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
//find user
async function findUser(req, res) {
    try {
        const result = await User.findById(req.params.id).select(["name", "avatar"])
        return res.json(result)
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
async function aboutUser(req, res) {
    try {
        const result = await User.findById(req.params.id).populate("address")
        return res.json(result)
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
//friends  list
async function friendsList(req, res) {
    try {
        const result = await User.find().select(["name", "email"])
        return res.json(result)
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
//Active  handler
async function activeHandler(req, res) {
    try {
        const userId = req.params.id
        const isActive = req.params.isActive
        await User.findByIdAndUpdate(userId, { softActive: isActive, isActive })
        return res.json({ message: "User updated successfully..." })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function deleteUser(req, res) {
    try {
        const { id } = req.params
        if (!id) return res.status(500).json({ message: "user id required!" })
        const user = await User.findById(id)
        if (!user) return res.status(500).json({ message: "User not found" });
        //delete user adreess realted data
        await Address.findByIdAndDelete(user.address)
        await Attendance.deleteMany({ studentID: user._id })
        await Assignments.deleteMany({ userId: user._id })
        await User.findByIdAndDelete(id)
        await MessageModel.deleteMany({ senderId: id })
        await ChatModel.deleteMany({ members: { $in: [id] } })

        return res.json({ message: "User Deleted Successfully..." })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}



const changePassword = async (req, res) => {
    try {
        const user = await User.findById(res.id)
        if (!user) return res.status(500).json({ message: "User not found" });
        const isVerified = compareSync(req.body.oldPassword, user?.password)
        if (!isVerified) return res.status(500).json({ message: "User Old Password Not Matching!" })
        const newPassword = await hash(req.body.password, 10)

        await User.findByIdAndUpdate(res.id, { ...req.body, password: newPassword })
        setAccessTokenCookie(res, "", 1)
        return res.json({ message: "Password Updated Successfully..." })

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//forget password
async function forgetpassword(req, res) {
    try {
        const user = await User.findOne({ email: req.body.email })
        if (!user) return res.status(500).json({ message: "User not found" });

        //if user found
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "24h" })
        const data = { name: user.name, token: `${process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://app.bgtechub.com"}/resetpassword/${token}` }
        await ejs.renderFile(path.join(__dirname, "../../mails/forgetpassword.ejs"), data)
        await sendEmail({
            email: user.email,
            subject: "Password Reset Request: Take Action Now",
            template: "forgetpassword.ejs",
            data
        })
        return res.json({ message: `Reset Password link has been sent on ${user?.email}` })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
module.exports = { aboutUser, activeHandler, createStudent, loginStudent, usersList, deleteUser, friendsList, findUser, changePassword, forgetpassword, activateAccount };
