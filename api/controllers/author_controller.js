const data = require('../data/data')
const logger = require('../utils/logger')

exports.getAuthor = (req, res) => {
  if (req.query.search) {
    data.searchAuthor(req.query.search)
      .then((resAuthors) => res.json(resAuthors))
      .catch((err) => {
        logger.error(err)
        res.status(503).json('Service Unavailable')
      })
  } else if (req.query.limit) {
    data.getAuthors(req.query.limit)
      .then((resAuthors) => res.json(resAuthors))
      .catch((err) => {
        logger.error(err)
        res.status(503).json('Service Unavailable')
      })
  } else if (req.query.id) {
    data.getAuthor(req.query.id)
      .then((resAuthor) => res.json(resAuthor))
      .catch((err) => {
        logger.error(err)
        res.status(503).json('Service Unavailable')
      })
  } else {
    data.getAuthors()
      .then((resAuthors) => res.json(resAuthors))
      .catch((err) => {
        logger.error(err)
        res.status(503).json('Service Unavailable')
      })
  }
}

exports.putAuthor = (req, res) => {
  if (req.query.name || req.query.surname || req.query.nickname) {
    if (req.query.name == null) {
      req.query.name = ''
    }
    if (req.query.surname == null) {
      req.query.surname = ''
    }
    if (req.query.nickname == null) {
      req.query.nickname = ''
    }

    let resAuthor = null
    searchAuthorBy(req.query.name, [req.query.name, req.query.surname, req.query.nickname])
      .then((res) => {
        if (res) {
          resAuthor = res
          return
        }
        return searchAuthorBy(req.query.surname, [req.query.name, req.query.surname, req.query.nickname])
      })
      .then((res) => {
        if (resAuthor) {
          return
        }
        if (res) {
          resAuthor = res
          return
        }
        return searchAuthorBy(req.query.nickname, [req.query.name, req.query.surname, req.query.nickname])
      })
      .then((res) => {
        if (resAuthor) {
          return
        }
        if (res) {
          resAuthor = res
          return
        }
        return data.putAuthor(req.query.name, req.query.surname, req.query.nickname)
      })
      .then((resA) => {
        if (resA) {
          resAuthor = resA
        }

        res.json(resAuthor)
      })
      .catch((err) => {
        logger.error(err)
        res.status(503).json('Service Unavailable')
      })
  } else {
    res.status(400).json('Bad Request, Author may have name, surname and nickname')
  }
}

// #region private functions

function searchAuthorBy (searchParam, [name, surname, nickname]) {
  return new Promise((resolve, reject) => {
    if (searchParam === '') {
      return resolve(null)
    }

    data.searchAuthor(searchParam)
      .then((resAuthors) => {
        resAuthors.some(author => {
          if (author.name.toUpperCase() === name.toUpperCase() &&
            author.surname.toUpperCase() === surname.toUpperCase() &&
            author.nickname.toUpperCase() === nickname.toUpperCase()) {
            return resolve(author)
          }
        })

        return resolve(null)
      })
      .catch((err) => {
        logger.error(err)
        reject(new Error('Cant get authors'))
      })
  })
}

// #endregion
