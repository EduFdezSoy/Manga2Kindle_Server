const data = require('../data/data')
const Converter = require('../utils/converter')
const path = require('path')
const logger = require('../utils/logger')

exports.postChapter = (req, res) => {
  if (!req.body.manga_id || !req.body.lang_id || !req.body.title || !req.body.chapter || !req.body.mail) {
    res.status(400).json('Bad Request')
    return
  }

  // get current date
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const yyyy = today.getFullYear()
  const hours = String(today.getHours()).padStart(2, '0')
  const min = String(today.getMinutes()).padStart(2, '0')
  const sec = String(today.getSeconds()).padStart(2, '0')

  // format datetime
  const datetime = '[' + yyyy + '-' + mm + '-' + dd + '_' + hours + ':' + min + ':' + sec + ']'

  // set a random to avoid any rewrite
  const random = Math.floor(Math.random() * (999 - 100 + 1) + 100)

  // form the path and name
  const filename = datetime + '_' + random + '.zip'
  req.body.route = path.join(__dirname, '/../../files/', filename)

  // for some reason all strings comes between ""
  req.body.title = req.body.title.substring(1, req.body.title.length - 1)
  req.body.mail = req.body.mail.substring(1, req.body.mail.length - 1)

  if (req.body.options != null) {
    // all strings comes between ""
    req.body.options = req.body.options.substring(1, req.body.options.length - 1)
    // need to replace " in the options since it is a string
    req.body.options = req.body.options.replace(/\\"/g, '"')
  } else {
    req.body.options = '{}'
  }

  // TODO: check file size

  // insert chapter data
  data.putChapter(req.body.manga_id, req.body.lang_id, req.body.title, req.body.volume, req.body.chapter, req.body.route, req.body.mail)
    .then((resChapter) => {
      req.body.id = resChapter.id
      req.body.title = resChapter.title
      // return chapter data
      res.json(resChapter)
      return data.setStatus(req.body.id, false, false, null)
    })
    // move file
    .then(req.files.file.mv(req.body.route))
    .then(() => {
      logger.verbose('Chapter copied to %s', req.body.route)
      req.body.converterObject = new Converter(
        req.body.id,
        req.body.manga_id,
        req.body.chapter,
        req.body.volume,
        req.body.title,
        req.body.route,
        req.body.mail,
        JSON.parse(req.body.options)
      )
      return data.setError(req.body.id, false, false, null)
    })
    .then((res) => req.body.converterObject.convert())
    .then((mailInfo) => logger.silly('done'))
    .catch((err) => {
      logger.error(err.message)
      data.setError(req.body.id, false, true, err.message)
        .catch((err) => logger.error(err.message))
      if (!res.headersSent) {
        res.status(503).json('Service Unavailable')
      }
    })
}
