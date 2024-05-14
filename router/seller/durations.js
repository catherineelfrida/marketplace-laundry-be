const express = require('express')
const controller = require('../../controller')
const { auth } = require('../../middleware/jwt')

const router = express.Router()

router.get('/servicedurations', auth, controller.durations.get)
router.get('/servicedurations/:id', auth, controller.durations.getById)
router.post('/servicedurations', auth, controller.durations.create)
router.put('/servicedurations/:id', auth, controller.durations.update)
router.delete('/servicedurations/:id', auth, controller.durations.destroy)

module.exports = router
