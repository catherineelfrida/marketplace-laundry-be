const express = require('express')
const controller = require('../controller')
const { auth } = require('../middleware/jwt')

const router = express.Router()

router.get('/transactions', auth, controller.transactions.get)
router.get('/transactions/:id', auth, controller.transactions.getById)
router.post('/stores/:store_id/transactions', auth, controller.transactions.create)
router.put('/transactions/:id', auth, controller.transactions.update)
router.patch('/transactions/:id', auth, controller.transactions.updatePaymentStatus);
router.delete('/transactions/:id', auth, controller.transactions.destroy)

module.exports = router