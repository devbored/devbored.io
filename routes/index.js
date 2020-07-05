/*  Copyright (c) 2020 DevBored     */
/*  Licensed under the MIT license. */

// File containing URL routes
const routes = require('express').Router()

/*  Main Pages  */
routes.get('/', function(req, res) {
    res.render('blog/index')
})
routes.get('/blog', function (req, res) {
    res.render('blog/index')
})
routes.get('/about', function (req, res) {
    res.render('about/index')
})

/*  Blog Posts  */
routes.get('/baremetal-kl25z-dev-pt1', function (req,res) {
    res.render('blog/baremetal-kl25z-dev-pt1')
})

module.exports = routes

