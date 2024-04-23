const config = {
  app: {
    port: process.env.PORT || 8080
  },
  jwt: {
    key: process.env.JWT_SECRET_KEY
  },
  api: {
    key: process.env.GOOGLE_MAPS_API_KEY
  }
}

module.exports = config
