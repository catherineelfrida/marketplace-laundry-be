const express = require('express')
const router = express.Router()
const controller = require('../controller')
const { auth } = require('../middleware/jwt')

router.get('/dashboard', auth, controller.dashboard.get)

module.exports = router
