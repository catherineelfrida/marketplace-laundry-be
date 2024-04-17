const auth = require('./api/v1/auth')
const users = require('./api/v1/users')
const stores = require('./api/v1/seller/stores')
const profiles = require('./api/v1/customer/profiles')
const servicetypes = require('./api/v1/seller/servicetypes')
const serviceitems = require('./api/v1/seller/serviceitems')
const servicedurations = require('./api/v1/seller/servicedurations')
const services = require('./api/v1/customer/services')
const transactions = require('./api/v1/transactions')
const sellerservices = require('./api/v1/seller/sellerservices')
const report = require('./api/v1/seller/report')
const dashboard = require('./api/v1/dashboard')

module.exports = { 
  auth,
  users,
  stores,
  profiles,
  servicetypes,
  serviceitems,
  servicedurations,
  services,
  transactions,
  sellerservices,
  report,
  dashboard
}
