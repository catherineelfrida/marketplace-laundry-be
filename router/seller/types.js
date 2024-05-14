const express = require('express')
const controller = require('../../controller')
const { auth } = require('../../middleware/jwt')

const router = express.Router()

router.get('/servicetypes', auth, controller.types.get)
router.get('/servicetypes/:id', auth, controller.types.getById)
router.post('/servicetypes', auth, controller.types.create)
router.put('/servicetypes/:id', auth, controller.types.update)
router.delete('/servicetypes/:id', auth, controller.types.destroy)

module.exports = router
