const { usersList, deleteUser, friendsList, findUser } = require('../controllers/auth/auth.controller')
const { authorize, setAccessTokenCookie } = require('../utils/auth.util')

const router = require('express').Router()

router.get('/list', usersList)
router.get('/friends/list', friendsList)
router.get('/find/:id', findUser)
router.delete('/delete/:id', authorize("admin"), deleteUser)
router.get('/logout', authorize("admin", "student"), (req, res) => {
    try {
        setAccessTokenCookie(res, "", 1)
        return res.json({ message: "logout successfully..." })
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})
module.exports = router