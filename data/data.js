/**
 * In this class we will call the dao with the values checked and return the objects formed as js objects
 */

const dao = require('./dao')

/**
 * 
 * @param {Function} callback
 */
exports.getMangas = (callback) => {
    dao.getMangas(null, callback)
} 

exports.searchManga = (search, callback) => {
    dao.searchManga(search, callback)
} 