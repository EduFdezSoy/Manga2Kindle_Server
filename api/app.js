/**
 * @files Main class, starts the server
 * @author Eduardo Fernandez <yo@edufdezsoy.es>
 * @copyright Eduardo Fernandez 2019
 * @license CC_BY-NC-SA_4.0
 */

const express = require('express')
const dotenv = require('dotenv')
const fileupload = require('express-fileupload')
const path = require('path')
const logger = require('morgan')

const indexRouter = require('./routes/index')
const mangaRouter = require('./routes/manga')

const app = express()
dotenv.config()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(fileupload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, '../', process.env.TEMP_FOLDER)
}))

app.use('/', indexRouter)
app.use('/manga', mangaRouter)

module.exports = app
