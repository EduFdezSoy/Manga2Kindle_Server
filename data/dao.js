/**
 * SQL ONLY, DONT DO SHIT HERE
 */

const { Pool } = require('pg')
const pool = new Pool()

/**
 * 
 * callback(err, res)
 */
exports.getMangas = (limit = 100, callback) => {
    pool.query('SELECT id, title, uuid, author_id FROM manga LIMIT $1', [limit], (err, res) => {
        if (err)
            callback(err.stack, null)
        else
            callback(null, res.rows)
    })
}

exports.searchManga = (search, callback) => {
    search = '%' + search + '%'

    pool.query('SELECT id, title, uuid, author_id FROM manga WHERE UPPER(title) LIKE UPPER($1) LIMIT 100', [search], (err, res) => {
        if (err)
            callback(err.stack, null)
        else
            callback(null, res.rows)
    })
}