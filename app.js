/**
 * @files Main class, starts the server 
 * @author Eduardo Fernandez <yo@edufdezsoy.es>
 * @copyright Eduardo Fernandez 2019
 * @license CC_BY-NC-SA_4.0
 */

const express = require('express')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const fileupload = require('express-fileupload')

const app = express()
dotenv.config()

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Manga2kindle server v${process.env.VERSION} listening on port ${port}!`))

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false, limit: '50mb' })
app.use(jsonParser)

app.use(fileupload({
    useTempFiles : true,
    tempFileDir  : './' + process.env.TEMP_FOLDER + '/'
}))

var routes = require('./routes/index')
routes(app)