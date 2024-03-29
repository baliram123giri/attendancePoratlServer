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
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1d' });
}

// Verify the access token
function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return null;
        return decoded;
    });
}

// Set a cookie with the access token
function setAccessTokenCookie(res, token, exipre = (24 * 60 * 60 * 1000),) {
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 1);
    return res.cookie('access_token', token, {
        maxAge: exipre, // 2 days in milliseconds
        expires: twoDaysFromNow,
        httpOnly: true,
        ...(process.env.NODE_ENV === "development" ? {} : {
            secure: true,
            sameSite: 'None',
            domain: ".bgtechub.com"
        })
    });

}

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
        if (!roles.includes(rest.role)) {
            return res.status(401).json({ message: `${rest.role} user dosn't have the permission!!` });
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

// function getTimeAndDate(type = "date") {
//     const date = new Date()
//     if (type === "date") {
//         const day = date.getDate()
//         const month = date.getMonth() + 1
//         const year = date.getFullYear()
//         return `${day < 10 ? `0${day}` : day}/${month < 10 ? `0${month}` : month}/${year}`
//     } else {
//         let hours = date.getHours()
//         const minutes = date.getMinutes()
//         hours = hours % 12 || 12
//         return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes} ${date.getHours() >= 12 ? "PM" : "AM"}`
//     }
// }

function getTimeAndDate(type = "date", locale = "en-IN", timezone = "Asia/Kolkata") {
    const date = new Date();

    if (type === "date") {
        return date.toLocaleString(locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: timezone
        });
    } else {
        const timeFormat = date.toLocaleString(locale, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: timezone
        });

        return timeFormat;
    }
}


function converDateYYMMDD(date) {
    return date?.split("/").reverse().join("-")
}

function getTimeDiff(created) {
    // Assuming created is a valid Date object or a date string
    const assignmentCreatedDate = new Date(created);

    // Get the current date
    const currentDate = new Date();

    // Calculate the difference in milliseconds
    const timeDifference = currentDate - assignmentCreatedDate;

    // Calculate the difference in days
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
    // Check if the difference is less than 15 days
    return Math.floor(daysDifference)

}
function generateRandomId() {
    const characters = '0123456789abcdef';
    let randomId = '';

    for (let i = 0; i < 32; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomId += characters.charAt(randomIndex);
    }

    return randomId;
}


module.exports = { generateAccessToken, getTimeDiff, verifyAccessToken, setAccessTokenCookie, authorize, deleteFiles, getTimeAndDate, converDateYYMMDD, generateRandomId }