const jwt = require("jsonwebtoken")

function authSign(req, res, next) {
    const isVerified = req.headers.authorization || ""
    try {
        if (!isVerified) {
            return res.status(500).json({ message: "please provide a token" })
        } else {

            const token = jwt.verify(isVerified.split(" ")[1], process.env.JWT_SECRET)

            if (!token) return res.status(500).json({ message: "token is expired!" })
            res.id = token.id
            res.role = token.role
            next()
        }
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }

}

async function rolesAuth(req, res, next) {
    try {
        if (res.role !== "admin") return res.status(500).json({ message: `${res.role} don't have the permission` })
        next()
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports = { authSign, rolesAuth }