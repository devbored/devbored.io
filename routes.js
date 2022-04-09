const fs        = require("fs");
const showdown  = require('showdown')
const routes    = require('express').Router()
const blogDir   = __dirname + '/views/blog/'
const aboutDir  = __dirname + '/views/about/'

// Helper to return converted Markdown body
function md2Html(mdFile) {
    var converter = new showdown.Converter()
    const content = fs.readFileSync(mdFile).toString()
    return converter.makeHtml(content)
}

/*  Main Pages  */
routes.get('/', function(req, res) {
    var body = md2Html(blogDir + 'index.md')
    res.render(__dirname + '/views/layout', {body: body})
})
routes.get('/blog', function (req, res) {
    // Do I really need this duplicated blog-post page???
    var body = md2Html(blogDir + 'index.md')
    res.render(__dirname + '/views/layout', {body: body})
})
routes.get('/about', function (req, res) {
    var body = md2Html(aboutDir + 'index.md')
    res.render(__dirname + '/views/layout', {body: body})
})

//  Blog Posts
// ====================================================================================================================
routes.get('/baremetal-kl25z-dev-pt1', function (req,res) {
    var body = md2Html(blogDir + 'baremetal-kl25z-dev-pt1.md')
    res.render(__dirname + '/views/layout', {body: body})
})

module.exports = routes