/**
 * In this class we will call the dao with the values checked and return the objects formed as js objects
 */

const dao = require('./dao')

// #region manga methods

/**
 *
 * @param {Function} callback
 */
exports.getManga = (id, callback) => {
  if (!id) {
    callback(new Error('A required param was null'), null)
  }

  dao.getManga(id, callback)
}

/**
 *
 * @param {Function} callback
 */
exports.getMangas = (limit = 100, callback) => {
  if (limit > 1000) {
    limit = 1000
  }

  dao.getMangas(limit, callback)
}

/**
 *
 * @param {String} search
 */
exports.searchManga = (search, callback) => {
  if (!search) {
    callback(new Error('A required param was null'), null)
  } else {
    search = search.trim()
    dao.searchManga(search, callback)
  }
}

/**
 *
 * @param {String} title
 * @param {String} uuid
 * @param {Number} author_id
 */
exports.putManga = (title, uuid, author_id, callback) => {
  if (!title || !uuid || !author_id) {
    callback(new Error('A required param was null'), null)
  } else {
    title = trimText(title, 150)
    if (title == '') {
      callback(new Error('A required param was a white string'), null)
    } else {
      dao.addManga(title, uuid, author_id, callback)
    }
  }
}

// #endregion

// #region author methods

/**
 *
 * @param {Number} limit
 * @param {Function} callback
 */
exports.getAuthors = (limit = 100, callback) => {
  if (limit > 1000) {
    limit = 1000
  }

  dao.getAuthors(limit, callback)
}

/**
 *
 * @param {Number} id
 * @param {Function} callback
 */
exports.getAuthor = (id, callback) => {
  if (!id) {
    c
    allback(new Error('A required param was null'), null)
  } else {
    dao.getAuthor(id, callback)
  }
}

/**
 *
 * @param {String} search
 * @param {Function} callback
 */
exports.searchAuthor = (search, callback) => {
  if (!search) {
    callback(new Error('A required param was null'), null)
  } else {
    search = trimSpaces(search)
    dao.searchAuthor(search, callback)
  }
}
/**
 *
 * @param {String} name
 * @param {String} surname
 * @param {String} nickname
 * @param {Function} callback
 */
exports.putAuthor = (name, surname, nickname, callback) => {
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
  dao.addAuthor(name, surname, nickname, callback)
}

// #endregion

// #region chapters

/**
 *
 * @param {Number} manga_id
 * @param {Number} lang_id
 * @param {String} title
 * @param {Number} volume
 * @param {Number} chapter
 * @param {String} route
 * @param {String} mail
 * @param {Function} callback
 */
exports.putChapter = (manga_id, lang_id, title, volume, chapter, route, mail, callback) => {
  if (!manga_id || !lang_id || !route || !mail) {
    callback(new Error('A required param was null'), null)
  } else {
    title = trimText(title, 100)
    mail = mail.trim()
    if (mail == '') {
      callback(new Error('A required param was a white string'), null)
    } else {
      dao.putChapter(manga_id, lang_id, title, volume, chapter, route, mail, callback)
    }
  }
}

// #endregion

// #region status

exports.getStatus = (chapter_id, callback) => {
  if (chapter_id) {
    dao.getStatus(chapter_id, (err, res) => {
      if (res && res[0]) {
        res[0].delivered = parseIntToBools(res[0].delivered)
        res[0].error = parseIntToBools(res[0].error)
      }
      callback(err, res)
    })
  } else {
    callback(400, null)
  }
}

exports.setStatus = (chapter_id, delivered = false, error = false, reason, callback) => {
  delivered = parseBools(delivered)
  error = parseBools(error)

  dao.setStatus(chapter_id, delivered, error, reason, callback)
}

exports.setError = (chapter_id, delivered = false, error = false, reason, callback) => {
  delivered = parseBools(delivered)
  error = parseBools(error)

  this.getStatus(chapter_id, (err, res) => {
    if (err) {
      callback(500, null)
    } else
    if (res[0] != null) {
      dao.editStatus(chapter_id, delivered, error, reason, callback)
    } else {
      dao.setStatus(chapter_id, delivered, error, reason, callback)
    }
  })
}

// #endregion

// #region utils

/**
 *
 * @param {String} uuid
 */
exports.uuidExists = (uuid) => {
  dao.uuidExists(uuid, (err, res) => {
    if (err) {
      return true
    } else
    if (res[0].count == 0) {
      return false
    } else {
      return true
    }
  })
}

/**
 *
 * @param {Function} callback
 */
exports.getLanguages = (callback) => {
  dao.getLanguages(callback)
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
  if (integer == 1) {
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
