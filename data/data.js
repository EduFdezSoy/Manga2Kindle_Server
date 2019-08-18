/**
 * In this class we will call the dao with the values checked and return the objects formed as js objects
 */

const dao = require('./dao')

//#region manga methods

/**
 * 
 * @param {Function} callback
 */
exports.getMangas = (limit = 100, callback) => {
    if (limit > 1000)
        limit = 1000

    dao.getMangas(limit, callback)
}

/**
 * 
 * @param {String} search
 */
exports.searchManga = (search, callback) => {
    if (!search)
        callback(new Error("A required param was null"), null)
    else {
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
    if (!title || !uuid || !author_id)
        callback(new Error("A required param was null"), null)
    else {
        title = title.trim()
        if (title == "")
            callback(new Error("A required param was a white string"), null)
        else
            dao.addManga(data.title, data.uuid, data.author_id, callback)
    }
}

//#endregion

//#region author methods

/**
 * 
 * @param {Number} limit
 * @param {Function} callback
 */
exports.getAuthors = (limit = 100, callback) => {
    if (limit > 1000)
        limit = 1000

    dao.getAuthors(limit, callback)
}

/**
 * 
 * @param {Number} id
 * @param {Function} callback
 */
exports.getAuthor = (id, callback) => {
    if (!id)
        callback(new Error("A required param was null"), null)
    else
        dao.getAuthor(id, callback)
}

/**
 * 
 * @param {String} search
 * @param {Function} callback
 */
exports.searchAuthor = (search, callback) => {
    if (!search)
        callback(new Error("A required param was null"), null)
    else {
        search = search.trim()
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
    if (!name)
        name = ""

    if (!surname)
        surname = ""

    if (!nickname)
        nickname = ""

    name = name.trim()
    surname = surname.trim()
    nickname = nickname.trim()
    dao.addAuthor(name, surname, nickname, callback)
}

//#endregion

//#region chapters

/**
 * 
 * @param {Number} manga_id
 * @param {Number} lang_id
 * @param {String} title
 * @param {Number} volume
 * @param {Number} chapter
 * @param {String} route
 * @param {String} checksum
 * @param {String} mail
 * @param {Function} callback
 */
exports.putChapter = (manga_id, lang_id, title, volume, chapter, route, checksum, mail, callback) => {
    if (!manga_id || !lang_id || !title || !route || !checksum || !mail)
        callback(new Error("A required param was null"), null)
    else {
        title = title.trim()
        mail = mail.trim()
        if (title == "" || mail == "")
            callback(new Error("A required param was a white string"), null)
        else
            dao.putChapter(manga_id, lang_id, title, volume, chapter, route, checksum, mail, callback)
    }
}

//#endregion

//#region status

exports.getStatus = (chapter_id, callback) => {
    if (chapter_id)
        dao.getStatus(chapter_id, callback)
    else
        callback(400, null)
}

exports.setStatus = (chapter_id, delivered = false, error = false, reason, callback) => {
    dao.setStatus(chapter_id, delivered, error, reason, callback)
}

exports.setError = (chapter_id, delivered = false, error = false, reason, callback) => {
    if (chapter_id)
        dao.editStatus(chapter_id, delivered, error, reason, callback)
    else
        dao.setStatus(chapter_id, delivered, error, reason, callback)
}

//#endregion

//#region utils

exports.uuidExists = (uuid) => {
    dao.uuidExists(uuid, (err, res) => {
        if (err)
            return true
        else
            if (res[0].count == 0)
                return false
            else
                return true
    })
}

exports.getLanguages = (callback) => {
    dao.getLanguages(callback)
}

//#endregion