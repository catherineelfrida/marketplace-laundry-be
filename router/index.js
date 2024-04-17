const express = require('express')
const router = express.Router()

const auth = require('./auth')
const users = require('./users')
const stores = require('./seller/stores')
const profiles = require('./customer/profiles')
const servicetypes = require('./seller/servicetypes')
const serviceitems = require('./seller/serviceitems')
const servicedurations = require('./seller/servicedurations')
const services = require('./customer/services')
const transactions = require('./transactions')
const sellerservices = require('./seller/sellerservices')
const report = require('./seller/report')
const dashboard = require('./dashboard')

router.use('/api/v1', auth)
router.use('/api/v1', users)
router.use('/api/v1', stores)
router.use('/api/v1', profiles)
router.use('/api/v1', servicetypes)
router.use('/api/v1', serviceitems)
router.use('/api/v1', servicedurations)
router.use('/api/v1', services)
router.use('/api/v1', transactions)
router.use('/api/v1', sellerservices)
router.use('/api/v1', report)
router.use('/api/v1', dashboard)

module.exports = router
