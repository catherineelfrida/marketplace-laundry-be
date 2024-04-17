const express = require('express')
const controller = require('../../controller')
const { auth } = require('../../middleware/jwt')

const router = express.Router()

router.get('/stores/:storeid/services', auth, controller.services.get)
router.get('/stores/:storeid/services/:id', auth, controller.services.getById)

module.exports = router
