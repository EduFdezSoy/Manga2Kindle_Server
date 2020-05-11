const data = require('../data/data')

exports.getAuthor = (req, res) => {
  if (req.query.search) {
    data.searchAuthor(req.query.search)
      .then((resAuthors) => res.json(resAuthors))
      .catch((err) => {
        console.error(err)
        res.status(503).json('Service Unavailable')
      })
  } else if (req.query.limit) {
    data.getAuthors(req.query.limit)
      .then((resAuthors) => res.json(resAuthors))
      .catch((err) => {
        console.error(err)
        res.status(503).json('Service Unavailable')
      })
  } else if (req.query.id) {
    data.getAuthor(req.query.id)
      .then((resAuthor) => res.json(resAuthor))
      .catch((err) => {
        console.error(err)
        res.status(503).json('Service Unavailable')
      })
  } else {
    data.getAuthors()
      .then((resAuthors) => res.json(resAuthors))
      .catch((err) => {
        console.error(err)
        res.status(503).json('Service Unavailable')
      })
  }
}

exports.putAuthor = (req, res) => {
  if (req.query.name || req.query.surname || req.query.nickname) {
    console.log('PUT /author called')

    if (req.query.name == null) {
      req.query.name = ''
    }
    if (req.query.surname == null) {
      req.query.surname = ''
    }
    if (req.query.nickname == null) {
      req.query.nickname = ''
    }

    let result = null

    data.searchAuthor(req.query.name)
      .then((resAuthors) => {
        resAuthors.some(author => {
          if (author.name.toUpperCase() === req.query.name.toUpperCase() &&
            author.surname.toUpperCase() === req.query.surname.toUpperCase() &&
            author.nickname.toUpperCase() === req.query.nickname.toUpperCase()) {
            result = [author]
            return true
          }
        })
      })
      .catch((err) => {
        console.error(err)
        res.status(503).json('Service Unavailable')
      })

    if (result == null) {
      data.searchAuthor(req.query.surname)
        .then((resAuthors) => {
          resAuthors.some(author => {
            if (author.name.toUpperCase() === req.query.name.toUpperCase() &&
              author.surname.toUpperCase() === req.query.surname.toUpperCase() &&
              author.nickname.toUpperCase() === req.query.nickname.toUpperCase()) {
              result = [author]
              return true
            }
          })
        })
        .catch((err) => {
          console.error(err)
          res.status(503).json('Service Unavailable')
        })
    }

    if (result == null) {
      data.searchAuthor(req.query.nickname)
        .then((resAuthors) => {
          resAuthors.some(author => {
            if (author.name.toUpperCase() === req.query.name.toUpperCase() &&
              author.surname.toUpperCase() === req.query.surname.toUpperCase() &&
              author.nickname.toUpperCase() === req.query.nickname.toUpperCase()) {
              result = [author]
              return true
            }
          })
        })
        .catch((err) => {
          console.error(err)
          res.status(503).json('Service Unavailable')
        })
    }

    if (result == null) {
      data.putAuthor(req.query.name, req.query.surname, req.query.nickname)
        .then((resAuthor) => {
          result = resAuthor
        })
        .catch((err) => {
          console.error(err)
          res.status(503).json('Service Unavailable')
        })
    }

    res.json(result)
  } else {
    res.status(400).json('Bad Request, Author may have name, surname and nickname')
  }
}
