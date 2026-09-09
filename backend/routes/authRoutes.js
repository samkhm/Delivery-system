const express = require("express")

const { register, login, getRiders} = require("../controllers/authController")
const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/riders', getRiders)

module.exports = router;