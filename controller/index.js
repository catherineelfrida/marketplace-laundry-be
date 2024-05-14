const auth = require('./api/v1/auth')
const users = require('./api/v1/users')
const stores = require('./api/v1/seller/stores')
const profiles = require('./api/v1/customer/profiles')
const types = require('./api/v1/seller/types')
const items = require('./api/v1/seller/items')
const durations = require('./api/v1/seller/durations')
const services = require('./api/v1/customer/services')
const transactions = require('./api/v1/transactions')
const sellerServices = require('./api/v1/seller/services')
const report = require('./api/v1/seller/reports')
const dashboard = require('./api/v1/dashboard')

module.exports = { 
  auth,
  users,
  stores,
  profiles,
  types,
  items,
  durations,
  services,
  transactions,
  sellerServices,
  report,
  dashboard
}
