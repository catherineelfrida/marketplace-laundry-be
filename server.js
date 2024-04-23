const express = require('express')
const cors = require('cors')
const routers = require('./router')
const config = require('./config/config.js')

const app = express()

// const host = process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0';
const port = config.app.port

const corsOptions = {
  origin: '*',
  methods: '*',
  credentials: true
}

app.use(express.json())
app.use(express.urlencoded({ extended:false }))

app.use(cors(corsOptions));

app.use(routers)

app.listen(port, () => {
  console.log(`Server is running at ${port}`)
})

module.exports = app
