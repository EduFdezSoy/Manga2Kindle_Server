const data = require('../data/data')

exports.getAuthor = (req, res) => {
  if (req.query.search) {
    console.log('GET /author called (search)')

    data.searchAuthor(req.query.search, (err, res2) => {
      if (err) {
        res.status(503).json('Service Unavailable')
      } else {
        res.json(res2)
      }
    })
  } else if (req.query.limit) {
    console.log('GET /author called (limit)')

    data.getAuthors(req.query.limit, (err, res2) => {
      if (err) {
        res.status(503).json('Service Unavailable')
      } else {
        res.json(res2)
      }
    })
  } else if (req.query.id) {
    console.log('GET /author called (id)')

    data.getAuthor(req.query.id, (err, res2) => {
      if (err) {
        res.status(503).json('Service Unavailable')
      } else {
        res.json(res2)
      }
    })
  } else {
    data.getAuthors(null, (err, res2) => {
      if (err) {
        res.status(503).json('Service Unavailable')
      } else {
        res.json(res2)
      }
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
    data.searchAuthor(req.query.name, (err, res2) => {
      if (!err) {
        res2.some(author => {
          if (author.name.toUpperCase() === req.query.name.toUpperCase() &&
                        author.surname.toUpperCase() === req.query.surname.toUpperCase() &&
                        author.nickname.toUpperCase() === req.query.nickname.toUpperCase()) {
            result = [author]
            return true
          }
        })
      }

      if (result == null) {
        data.searchAuthor(req.query.surname, (err, res2) => {
          if (!err) {
            res2.some(author => {
              if (author.name.toUpperCase() === req.query.name.toUpperCase() &&
                                author.surname.toUpperCase() === req.query.surname.toUpperCase() &&
                                author.nickname.toUpperCase() === req.query.nickname.toUpperCase()) {
                result = [author]
                return true
              }
            })
          }

          if (result == null) {
            data.searchAuthor(req.query.nickname, (err, res2) => {
              if (!err) {
                res2.some(author => {
                  if (author.name.toUpperCase() === req.query.name.toUpperCase() &&
                                        author.surname.toUpperCase() === req.query.surname.toUpperCase() &&
                                        author.nickname.toUpperCase() === req.query.nickname.toUpperCase()) {
                    result = [author]
                    return true
                  }
                })
              }

              if (result == null) {
                data.putAuthor(req.query.name, req.query.surname, req.query.nickname, (err, res2) => {
                  if (err) {
                    res.status(503).json('Service Unavailable')
                  } else {
                    res.json(res2)
                  }
                })
              } else {
                res.json(result)
              }
            })
          } else {
            res.json(result)
          }
        })
      } else {
        res.json(result)
      }
    })
  } else {
    console.log('PUT /author called (Bad Request)')

    res.status(400).json('Bad Request, Author may have name, surname and nickname')
  }
}
