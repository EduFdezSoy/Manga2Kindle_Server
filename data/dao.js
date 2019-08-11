/**
 * SQL ONLY, DONT DO SHIT HERE
 */

const { Pool } = require('pg')
const pool = new Pool()

//#region manga methods

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

exports.addManga = (title, uuid, author_id, callback) => {
    pool.query('INSERT INTO manga(title, uuid, author_id) VALUES ($1, $2, $3) RETURNING id, title, uuid, author_id', [title, uuid, author_id], (err, res) => {
        if (err)
            callback(err.stack, null)
        else
            callback(null, res.rows)
    })
}

//#endregion

//#region author methods

exports.getAuthors = (limit, callback) => {
    pool.query('SELECT id, name, surname, nickname FROM author LIMIT $1', [limit], (err, res) => {
        if (err)
            callback(err.stack, null)
        else
            callback(null, res.rows)
    })
}

exports.searchAuthor = (search, callback) => {
    search = '%' + search + '%'

    pool.query('SELECT id, name, surname, nickname FROM author WHERE ' +
        'UPPER(name) LIKE UPPER($1) OR ' +
        'UPPER(surname) LIKE UPPER($1) OR ' +
        'UPPER(nickname) LIKE UPPER($1) ' +
        'LIMIT 100', [search], (err, res) => {
            if (err)
                callback(err.stack, null)
            else
                callback(null, res.rows)
        })
}

exports.addAuthor = (name, surname, nickname, callback) => {

    pool.query('INSERT INTO author(name, surname, nickname) VALUES ($1, $2, $3) RETURNING id, name, surname, nickname', [name, surname, nickname], (err, res) => {
        if (err)
            callback(err.stack, null)
        else
            callback(null, res.rows)
    })
}

//#endregion