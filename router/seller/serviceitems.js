const express = require('express')
const controller = require('../../controller')
const { auth } = require('../../middleware/jwt')

const router = express.Router()

router.get('/serviceitems', auth, controller.serviceitems.get)
router.get('/serviceitems/:id', auth, controller.serviceitems.getById)
router.post('/serviceitems', auth, controller.serviceitems.create)
router.put('/serviceitems/:id', auth, controller.serviceitems.update)
router.delete('/serviceitems/:id', auth, controller.serviceitems.destroy)

module.exports = router
