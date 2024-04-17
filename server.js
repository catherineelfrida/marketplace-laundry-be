const express = require('express')
const cors = require('cors')
const routers = require('./router')
const config = require('./config/config.js')

const app = express()

const port = config.app.port

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: '*',
  credentials: true
}

app.use(express.json())
app.use(express.urlencoded({ extended:false }))

app.use(cors(corsOptions));

app.use(routers)

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})

module.exports = app
