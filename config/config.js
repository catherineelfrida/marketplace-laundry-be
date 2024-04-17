const config = {
  app: {
    port: process.env.PORT || 80
  },
  jwt: {
    key: process.env.JWT_SECRET_KEY || JWT_SECRET_KEY
  },
  api: {
    key: process.env.GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY
  }
}

module.exports = config
