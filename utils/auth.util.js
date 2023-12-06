// const jwt = require("jsonwebtoken")

// function authSign(req, res, next) {
//     const isVerified = req.cookies
//     try {
//         if (!isVerified) {
//             return res.status(500).json({ message: "please provide a token" })
//         } else {

//             const token = jwt.verify(isVerified.split(" ")[1], process.env.JWT_SECRET)

//             if (!token) return res.status(500).json({ message: "token is expired!" })
//             res.id = token.id
//             res.role = token.role
//             next()
//         }
//     } catch (error) {
//         return res.status(500).json({ message: error.message })
//     }

// }

// async function rolesAuth(req, res, next) {
//     try {
//         if (res.role !== "admin") return res.status(500).json({ message: `${res.role} don't have the permission` })
//         next()
//     } catch (error) {
//         return res.status(500).json({ message: error.message })
//     }
// }

// module.exports = { authSign, rolesAuth }

const jwt = require('jsonwebtoken');
const fs = require("fs");
// Generate an access token
function generateAccessToken(user) {
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '58m' });
}

// Verify the access token
function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return null;
        return decoded;
    });
}

// Set a cookie with the access token
function setAccessTokenCookie(res, token, exipre = 2 * 24 * 60 * 60 * 1000,) {

    return res.cookie('access_token', token, {
        maxAge: exipre, // 2 days in milliseconds
        httpOnly: true,
        sameSite: 'None',
        secure: true,

    });

}
// ...(process.env.NODE_ENV === "development" ? {} : { domain: ".bgtechub.com", sameSite: 'None', secure: true, })
function authorize(...roles) {
    // Refresh the access token cookie
    return function refreshAccessToken(req, res, next) {
        const token = req.cookies.access_token;
        // console.log()
        if (!token) {
            setAccessTokenCookie(res, "", 1);
            return res.status(401).json(`Unauthorize Access`);
        }

        const decoded = verifyAccessToken(token);

        if (!decoded) {
            setAccessTokenCookie(res, "", 1);
            return res.status(401).json(`Unauthorize Access`);
        }


        // const user = decoded.user; // assuming you've added the user object to the token payload
        const { exp, iat, ...rest } = decoded
        res.id = rest._id
        res.role = rest.role
        const newToken = generateAccessToken(rest);
        setAccessTokenCookie(res, newToken);
        if (!roles.includes(rest.role) && rest.role !== "admin") {
            return res.status(401).json(`${rest.role} user dosn't have the permission!!`);
        }
        else {
            next()
        }
    }
}


function deleteFiles(req) {
    if (req.files) {
        for (const file of Object.values(req.files)) {
            if (Array.isArray(file)) {
                for (const f of file) {
                    fs.unlinkSync(f.path);
                }
            } else {
                fs.unlinkSync(file.path);
            }
        }
    }
}

module.exports = { generateAccessToken, verifyAccessToken, setAccessTokenCookie, authorize, deleteFiles }