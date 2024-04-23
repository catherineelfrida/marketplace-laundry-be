const express = require('express')
const cors = require('cors')
const routers = require('./router')
const config = require('./config/config.js')

const app = express()

const host = process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0';
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

app.listen(host, port, () => {
  console.log(`Server is running at http://${host}:${port}`)
})

module.exports = app
