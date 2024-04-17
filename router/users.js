const express = require('express')
const controller = require('../controller')
const { auth } = require('../middleware/jwt')

const router = express.Router()

router.get('/users', auth, controller.users.get)
router.get('/users/:id', auth, controller.users.getById)
router.post('/users', controller.users.create)
router.put('/users/:id', auth, controller.users.update)
router.delete('/users/:id', auth, controller.users.destroy)

module.exports = router

  