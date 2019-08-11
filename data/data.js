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
    uuid = "urn:uuid:74357528-3935-2740-8282-624925313108" //TODO: generar UUID
    dao.addManga(data.title, uuid, data.author_id, callback)
}

//#endregion

//#region author methods

exports.getAuthors = (limit = 100, callback) => {
    dao.getAuthors(limit, callback)
}

exports.searchAuthor = (search, callback) => {
    dao.searchAuthor(search, callback)
}

exports.putAuthor = (data, callback) => {
    dao.addAuthor(data.name, data.surname, data.nickname, callback)
}

//#endregion