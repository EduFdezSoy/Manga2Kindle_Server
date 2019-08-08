const express = require('express')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')

const app = express()
dotenv.config()

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Manga2kindle server v${process.env.VERSION} listening on port ${port}!`))

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(jsonParser)

var routes = require('./routes/index')
routes(app)