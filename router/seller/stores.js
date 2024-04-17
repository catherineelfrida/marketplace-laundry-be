const express = require('express')
const controller = require('../../controller')
const { auth } = require('../../middleware/jwt')

const router = express.Router()

router.get('/stores', auth, controller.stores.get)
router.get('/stores/:id', auth, controller.stores.getById)
router.post('/stores', auth, controller.stores.create)
router.put('/stores', auth, controller.stores.update)
router.delete('/stores', auth, controller.stores.destroy)
router.delete('/stores/:username', auth, controller.stores.destroyadmin)

module.exports = router
