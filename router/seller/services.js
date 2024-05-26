const express = require('express')
const controller = require('../../controller')
const { auth } = require('../../middleware/jwt')

const router = express.Router()

router.get('/services', auth, controller.sellerServices.get)
router.get('/services/:id', auth, controller.sellerServices.getById)
router.post('/services', auth, controller.sellerServices.create)
router.put('/services/:id', auth, controller.sellerServices.update)
router.delete('/services/:id', auth, controller.sellerServices.destroy)

module.exports = router
