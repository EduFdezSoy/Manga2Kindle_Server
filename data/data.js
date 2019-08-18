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
    dao.getMangas(limit, callback)
}

exports.searchManga = (search, callback) => {
    dao.searchManga(search, callback)
}

exports.putManga = (data, callback) => {
    dao.addManga(data.title, data.uuid, data.author_id, callback)
}

//#endregion

//#region author methods

exports.getAuthors = (limit = 100, callback) => {
    dao.getAuthors(limit, callback)
}

exports.getAuthor = (id, callback) => {
    dao.getAuthor(id, callback)
}

exports.searchAuthor = (search, callback) => {
    dao.searchAuthor(search, callback)
}

exports.putAuthor = (data, callback) => {
    if (!data.name)
        data.name = ""

    if (!data.surname)
        data.surname = ""

    if (!data.nickname)
        data.nickname = ""

    dao.addAuthor(data.name, data.surname, data.nickname, callback)
}

//#endregion

//#region chapters

exports.putChapter = (data, callback) => {
    dao.putChapter(data.manga_id, data.lang_id, data.title, data.volume, data.chapter, data.route, data.checksum, data.email, callback)
}

//#endregion

//#region status

exports.getStatus = (chapter_id, callback) => {
    if (chapter_id)
        dao.getStatus(chapter_id, callback)
    else
        callback(400, null)
}

exports.setStatus = (data, callback) => {
    if (data.delivered == null)
        data.delivered = false

    if (data.error == null)
        data.error = false

    dao.setStatus(data.chapter_id, data.delivered, data.error, data.reason, callback)
}

exports.setError = (data, callback) => {
    // TODO: check data and return errors

    if (data.delivered == null)
        data.delivered = false

    if (data.error == null)
        data.error = true

    if (data.chapter_id)
        dao.editStatus(data.chapter_id, data.delivered, data.error, data.reason, callback)
    else
        dao.setStatus(data.chapter_id, data.delivered, data.error, data.reason, callback)
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