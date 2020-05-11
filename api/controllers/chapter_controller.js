const data = require('../data/data')
const Converter = require('../utils/converter')
const path = require('path')

exports.postChapter = (req, res) => {
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
  console.log('POST /manga/chapter called')

  // insert chapter data
  data.putChapter(req.body.manga_id, req.body.lang_id, req.body.title, req.body.volume, req.body.chapter, req.body.route, req.body.mail)
    .then((resChapter) => {
      const id = resChapter[0].id
      req.body.title = resChapter[0].title
      // return chapter data
      res.json(resChapter)
      data.setStatus(id, false, false, null)

      // move file
      req.files.file.mv(req.body.route, (err) => {
        if (err) {
          console.log(err)
          data.setError(id, false, true, 'Unable to move: ' + err)
            .catch((err) => console.error(err))
        } else {
          console.log('copied ' + req.body.route)

          const converterObject = new Converter(
            id,
            req.body.manga_id,
            req.body.chapter,
            req.body.volume,
            req.body.title,
            req.body.route,
            req.body.mail,
            JSON.parse(req.body.options)
          )
          return data.setStatus(id, false, false, null)
            .then((res) => converterObject.convert())
            .then((mailInfo) => console.log('done'))
            .catch((err) => console.error(err))
        }
      })
    })
    .catch((err) => {
      console.error(err)
      res.status(503).json('Service Unavailable')
    })
}
