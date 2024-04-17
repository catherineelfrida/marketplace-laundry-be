const express = require('express')
const controller = require('../../controller')
const { auth } = require('../../middleware/jwt')

const router = express.Router()

router.get('/profiles', auth, controller.profiles.get)
router.get('/profiles/:id', auth, controller.profiles.getById)
router.post('/profiles', auth, controller.profiles.create)
router.put('/profiles', auth, controller.profiles.update)
router.delete('/profiles', auth, controller.profiles.destroy)
router.delete('/profiles/:username', auth, controller.profiles.destroyadmin)

module.exports = router
