/**
 * In this class we will call the dao with the values checked and return the objects formed as js objects
 */

const dao = require('./dao')
const logger = require('../utils/logger')

// #region manga methods

exports.getManga = (id) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(new Error('A required param was null'))
    }

    dao.getManga(id)
      .then((res) => resolve(res))
      .catch((err) => reject(err))
  })
}

exports.getMangas = (limit = 100) => {
  return new Promise((resolve, reject) => {
    if (limit > 1000) {
      limit = 1000
    }

    dao.getMangas(limit)
      .then((res) => resolve(res))
      .catch((err) => reject(err))
  })
}

/**
 *
 * @param {String} search
 */
exports.searchManga = (search) => {
  return new Promise((resolve, reject) => {
    if (!search) {
      reject(new Error('A required param was null'))
    } else {
      search = search.trim()

      dao.searchManga(search)
        .then((res) => resolve(res))
        .catch((err) => reject(err))
    }
  })
}

/**
 *
 * @param {String} title
 * @param {String} uuid
 * @param {Number} authorId
 */
exports.putManga = (title, uuid, authorId) => {
  return new Promise((resolve, reject) => {
    if (!title || !uuid || !authorId) {
      reject(new Error('A required param was null'))
    } else {
      title = trimText(title, 150)
      if (title === '') {
        reject(new Error('A required param was a white string'))
      } else {
        dao.addManga(title, uuid, authorId)
          .then((res) => resolve(res))
          .catch((err) => reject(err))
      }
    }
  })
}

// #endregion

// #region author methods

/**
 *
 * @param {Number} limit
 */
exports.getAuthors = (limit = 100) => {
  if (limit > 1000) {
    limit = 1000
  }

  return dao.getAuthors(limit)
}

/**
 *
 * @param {Number} id
 */
exports.getAuthor = (id) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(new Error('A required param was null'))
    } else {
      dao.getAuthor(id)
        .then((res) => resolve(res))
        .catch((err) => reject(err))
    }
  })
}

/**
 *
 * @param {String} search
 */
exports.searchAuthor = (search) => {
  return new Promise((resolve, reject) => {
    if (!search) {
      reject(new Error('A required param was null'))
    } else {
      search = trimSpaces(search)
      dao.searchAuthor(search)
        .then((res) => resolve(res))
        .catch((err) => reject(err))
    }
  })
}
/**
 *
 * @param {String} name
 * @param {String} surname
 * @param {String} nickname
 */
exports.putAuthor = (name, surname, nickname) => {
  return new Promise((resolve, reject) => {
    if (!name) {
      name = ''
    }

    if (!surname) {
      surname = ''
    }

    if (!nickname) {
      nickname = ''
    }

    name = name.trim()
    surname = surname.trim()
    nickname = nickname.trim()

    dao.addAuthor(name, surname, nickname)
      .then((res) => resolve(res))
      .catch((err) => reject(err))
  })
}

// #endregion

// #region chapters

/**
 *
 * @param {Number} mangaId
 * @param {Number} langId
 * @param {String} title
 * @param {Number} volume
 * @param {Number} chapter
 * @param {String} route
 * @param {String} mail
 */
exports.putChapter = (mangaId, langId, title, volume, chapter, route, mail) => {
  return new Promise((resolve, reject) => {
    if (!mangaId || !langId || !route || !mail) {
      reject(new Error('A required param was null'))
    } else {
      title = trimText(title, 100)
      mail = mail.trim()
      if (mail === '') {
        reject(new Error('A required param was a white string'))
      } else {
        dao.putChapter(mangaId, langId, title, volume, chapter, route, mail)
          .then((res) => resolve(res))
          .catch((err) => reject(err))
      }
    }
  })
}

// #endregion

// #region status

exports.getStatus = (chapterId) => {
  return new Promise((resolve, reject) => {
    if (chapterId) {
      dao.getStatus(chapterId)
        .then((res) => {
          if (res && res[0]) {
            res[0].delivered = parseIntToBools(res[0].delivered)
            res[0].error = parseIntToBools(res[0].error)
          }
          resolve(res)
        })
        .catch((err) => reject(err))
    } else {
      reject(new Error('400'))
    }
  })
}

exports.setStatus = (chapterId, delivered = false, error = false, reason) => {
  return new Promise((resolve, reject) => {
    delivered = parseBools(delivered)
    error = parseBools(error)

    dao.setStatus(chapterId, delivered, error, reason)
      .then((res) => resolve(res))
      .catch((err) => reject(err))
  })
}

exports.setError = (chapterId, delivered = false, error = false, reason) => {
  return new Promise((resolve, reject) => {
    delivered = parseBools(delivered)
    error = parseBools(error)

    this.getStatus(chapterId)
      .then((res) => {
        if (res[0] != null) {
          dao.editStatus(chapterId, delivered, error, reason)
            .then((res) => resolve(res))
            .catch((err) => reject(err))
        } else {
          dao.setStatus(chapterId, delivered, error, reason)
            .then((res) => resolve(res))
            .catch((err) => reject(err))
        }
      })
      .catch((err) => reject(err))
  })
}

// #endregion

// #region utils

/**
 *
 * @param {String} uuid
 */
exports.uuidExists = (uuid) => {
  dao.uuidExists(uuid)
    .then((res) => {
      if (res[0].count === 0) {
        return false
      } else {
        return true
      }
    })
    .catch((err) => {
      logger.error(err.message)
      return true
    })
}

exports.getLanguages = () => {
  return dao.getLanguages()
}

/**
 *
 * @param {Boolean} boolean
 */
// NOTE: booleans 0 = false, 1 = true
function parseBools (boolean) {
  if (boolean) {
    return 1
  } else {
    return 0
  }
}

/**
 *
 * @param {Number} integer
 */
// NOTE: booleans 0 = false, 1 = true
function parseIntToBools (integer) {
  if (integer === 1) {
    return true
  } else {
    return false
  }
}

/**
 * Removes white spaces from start and end but also removes duplicated spaces in it
 *
 * @param {String} text
 */
function trimSpaces (text) {
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Trim a text to a desired length.
 * If the text length is longer than the length param it will add ... to the end of the returned string
 *
 * @param {String} text Text to trim
 * @param {Number} length Trim to this length
 *
 * @returns {String} The text trimed to the length
 */
function trimText (text, length) {
  text = trimSpaces(text)
  if (text.length > length) {
    text = text.substring(0, length - 3)
    text += '...'
    return text
  } else {
    return text
  }
}

// #endregion
