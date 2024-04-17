const express = require('express')
const controller = require('../../controller')
const { auth } = require('../../middleware/jwt')

const router = express.Router()

router.get('/services', auth, controller.sellerservices.get)
router.get('/services/:id', auth, controller.sellerservices.getById)
router.post('/services', auth, controller.sellerservices.create)
router.put('/services/:id', auth, controller.sellerservices.update)
router.delete('/services/:id', auth, controller.sellerservices.destroy)

module.exports = router
