const fs = require("fs");
const showdown = require('showdown')

// File containing URL routes
const routes = require('express').Router()

/*  Main Pages  */
routes.get('/', function(req, res) {
    const testMeMd = fs.readFileSync(__dirname + '/../views/blog/testMe.md').toString()
    var converter = new showdown.Converter()
    var testMe = converter.makeHtml(testMeMd)
    res.render('blog/index', {
        testMe: testMe
    })
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

