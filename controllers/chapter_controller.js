const data = require('../data/data')
const async_converter = require('../services/async_converter')

exports.postChapter = (req, res) => {
  // get current date
  let today = new Date()
  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const yyyy = today.getFullYear()
  today = '[' + dd + '-' + mm + '-' + yyyy + ']'

  // set a random to avoid any rewrite
  const random = Math.floor(Math.random() * (999 - 100 + 1) + 100)

  // form the path and name
  req.body.route = __dirname + '/../files/' + today + '_' + req.files.file.md5.substring(0, 7) + '_' + random + '.zip'

  // for some reason I can see right now the checksum and title and the mail to comes between ""
  req.body.checksum = req.body.checksum.substring(1, req.body.checksum.length - 1)
  req.body.title = req.body.title.substring(1, req.body.title.length - 1)
  req.body.mail = req.body.mail.substring(1, req.body.mail.length - 1)

  // check integrity
  if (req.files.file.md5 != req.body.checksum) {
    console.log('POST /manga/chapter called (Bad Request)')
    res.status(400).json('Bad Request, checksum mismatch')
  } else {
    console.log('POST /manga/chapter called')

    // insert chapter data
    data.putChapter(req.body.manga_id, req.body.lang_id, req.body.title, req.body.volume, req.body.chapter, req.body.route, req.body.checksum, req.body.mail, (err, res2) => {
      if (err) {
        res.status(503).json('Service Unavailable')
      } else {
        const id = res2[0].id
        req.body.title = res2[0].title
        // return chapter data
        res.json(res2)

        // move file
        req.files.file.mv(req.body.route, (err) => {
          if (err) {
            console.log(err)
            data.setError(id, false, true, 'Unable to move: ' + err, (err, res) => {
              if (err) {
                console.log(err)
              }
            })
          } else {
            console.log('copied ' + req.body.route)

            const converter = new async_converter().getInstance()
            const converter_object = converter.formConvObject(
              id,
              req.body.manga_id,
              req.body.chapter,
              req.body.volume,
              req.body.title,
              req.body.route,
              req.body.mail
            )

            data.setStatus(id, false, false, null, (err, res) => {
              if (err) {
                console.log(err)
                data.setError(id, false, true, 'Unable to save to database: ' + err, (err, res) => {
                  if (err) { console.log(err) }
                })
              } else {
                // launch async converter
                converter.convert(converter_object)
              }
            })
          }
        })
      }
    })
  }
}
