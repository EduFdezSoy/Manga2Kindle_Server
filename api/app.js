/**
 * @files Main class, starts the server
 * @author Eduardo Fernandez <yo@edufdezsoy.es>
 * @copyright Eduardo Fernandez 2019
 * @license CC_BY-NC-SA_4.0
 */

require('dotenv').config()
const express = require('express')
const fileupload = require('express-fileupload')
const path = require('path')
const morgan = require('morgan')
const logger = require('./utils/logger')

const indexRouter = require('./routes/index')
const mangaRouter = require('./routes/manga')

const app = express()

app.use(morgan(':method | ":url" | "HTTP/:http-version" | :status | ":referrer" | ":user-agent"', { stream: logger.stream }))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(fileupload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, '../', process.env.TEMP_FOLDER)
}))

app.use('/', indexRouter)
app.use('/manga', mangaRouter)

module.exports = app
