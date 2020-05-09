const express = require('express')
const router = express.Router()
const authors = require('../controllers/author_controller')
const lang = require('../controllers/lang_controller')
const status = require('../controllers/status_controller')
const packageJson = require('../../package.json')

// index
router.get('/', (req, res) => res.json(process.env.MASTER_NAME + ' v' + packageJson.version))

router.get('/hello', (req, res) => res.json({
  name: process.env.MASTER_NAME,
  version: packageJson.version
}))

// author
router.route('/author')
  .get(authors.getAuthor)
  .put(authors.putAuthor)

// status
router.route('/status')
  .get(status.getStatus)
  .put(status.setError)

// languaje
router.route('/languages')
  .get(lang.getLanguages)

module.exports = router
