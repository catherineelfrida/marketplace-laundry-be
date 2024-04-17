const express = require('express')
const controller = require('../../controller')
const { auth } = require('../../middleware/jwt')

const router = express.Router()

router.get('/servicetypes', auth, controller.servicetypes.get)
router.get('/servicetypes/:id', auth, controller.servicetypes.getById)
router.post('/servicetypes', auth, controller.servicetypes.create)
router.put('/servicetypes/:id', auth, controller.servicetypes.update)
router.delete('/servicetypes/:id', auth, controller.servicetypes.destroy)

module.exports = router
