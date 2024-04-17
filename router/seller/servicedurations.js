const express = require('express')
const controller = require('../../controller')
const { auth } = require('../../middleware/jwt')

const router = express.Router()

router.get('/servicedurations', auth, controller.servicedurations.get)
router.get('/servicedurations/:id', auth, controller.servicedurations.getById)
router.post('/servicedurations', auth, controller.servicedurations.create)
router.put('/servicedurations/:id', auth, controller.servicedurations.update)
router.delete('/servicedurations/:id', auth, controller.servicedurations.destroy)

module.exports = router
