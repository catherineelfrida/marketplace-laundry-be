const express = require('express')
const controller = require('../../controller')
const { auth } = require('../../middleware/jwt')

const router = express.Router()

router.get('/serviceitems', auth, controller.items.get)
router.get('/serviceitems/:id', auth, controller.items.getById)
router.post('/serviceitems', auth, controller.items.create)
router.put('/serviceitems/:id', auth, controller.items.update)
router.delete('/serviceitems/:id', auth, controller.items.destroy)

module.exports = router
