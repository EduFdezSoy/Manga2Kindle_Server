const data = require('../data/data')

exports.getManga = (req, res) => {
  if (req.query.search) {
    data.searchManga(req.query.search)
      .then((mangas) => res.json(mangas))
      .catch((err) => {
        console.error(err)
        res.status(503).json('Service Unavailable')
      })
  } else if (req.query.limit) {
    data.getMangas(req.query.limit)
      .then((mangas) => res.json(mangas))
      .catch((err) => {
        console.error(err)
        res.status(503).json('Service Unavailable')
      })
  } else {
    data.getMangas()
      .then((mangas) => res.json(mangas))
      .catch((err) => {
        console.error(err)
        res.status(503).json('Service Unavailable')
      })
  }
}

exports.putManga = (req, res) => {
  if (req.query.title && req.query.author_id) {
    console.log('PUT /manga called')

    // check if the manga already exists
    data.searchManga(req.query.title)
      .then((mangas) => {
        if (mangas[0] && mangas[0].author_id === req.query.author_id) {
          res.json([mangas[0]])
        } else {
          do {
            req.query.uuid = 'urn:uuid:74357528-3935-2740-8282-' // TODO: add this to the .env
            req.query.uuid += Math.floor(Math.random() * (999999999999 - 100000000000) + 100000000000)
          } while (data.uuidExists(req.query.uuid))

          data.putManga(req.query.title, req.query.uuid, req.query.author_id)
            .then((manga) => res.json(manga))
            .catch((err) => {
              res.status(503).json({
                msg: 'Service Unavailable',
                error: err
              })
            })
        }
      })
      .catch((err) => {
        res.status(503).json({
          msg: 'Service Unavailable',
          error: err
        })
      })
  } else {
    console.log('PUT /manga called (Bad Request)')

    res.status(400).json('Bad Request, Manga may have title and author identifier')
  }
}
