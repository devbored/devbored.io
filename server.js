// Server Inits
const express = require('express')
const server = express()
const bodyParser = require('body-parser')
const path = require('path')
const routes = require('./routes')
const expLayouts = require('express-ejs-layouts')

// Load View Engine
server.set('views', path.join(__dirname, 'views'))
server.set('view engine', 'ejs')

// Enable middleware and enable static paths
server.use(expLayouts)
server.use(bodyParser())
server.use('/css', express.static(__dirname + '/static/css'))
server.use('/images', express.static(__dirname + '/static/images'))
server.use('/',routes)

// Start Server
server.listen(8080, function () {
    console.log('Server started on port 8080...')
})

