const { default: mongoose } = require("mongoose");
const { User, Address } = require("../../models/user.model");
const { studentCreate, loginSchema } = require("./validation");
const { hash, compareSync } = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
    generateAccessToken,
    setAccessTokenCookie,
} = require("../../utils/auth.util");
//create user
async function createStudent(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        await studentCreate.validateAsync(req.body);
        const { address, ...rest } = req.body;

        //if user email found through error
        const user = await User.findOne({ email: rest.email });
        if (user)
            return res.status(501).json({ message: "User email alreay exist!" });

        //if not  create a user but before that create user address and track in dtl => data transaction language

        const addressResult = await Address.create([address], { session });
        //now add user
        //hash password
        const password = await hash(rest.password, 10);
        await User.create([{ ...rest, password, address: addressResult[0]._id }], {
            session,
        });
        await session.commitTransaction();

        //send response
        return res.json({ message: "User created successfully" });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        await session.endSession();
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
        user.password = undefined;
        const token = generateAccessToken(user._doc);

        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
        user.role = undefined;
        res.cookie('testing', token, {
            maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds
            expires: twoDaysFromNow,
            secure: true,
            httpOnly: true,
            sameSite: 'None',
            domain: ".bgtechub.com"
        });


        // setAccessTokenCookie(res, token);


        return res.json({
            ...user._doc,
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
                $unwind: "$addressData",
            },
            {
                $project: {
                    password: 0,
                    __v: 0,
                    role: 0
                }
            }
        ]);
        return res.json(users);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function deleteUser(req, res) {
    try {
        const { id } = req.params
        if (!id) return res.status(500).json({ message: "user id required!" })
        await User.findByIdAndDelete(id)
        return res.json({ message: "User Deleted Successfully..." })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
module.exports = { createStudent, loginStudent, usersList, deleteUser };
