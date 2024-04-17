const express = require('express')
const router = express.Router()
const controller = require('../controller')
const { auth } = require('../middleware/jwt')

router.post('/auth/login', controller.auth.login)
router.get('/auth/whoami', auth, controller.auth.whoami)

module.exports = router
