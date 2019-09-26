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
exports.getManga = (id, callback) => {
    pool.query('SELECT id, title, uuid, author_id FROM manga WHERE id = $1', [id], (err, res) => {
        if (err)
            callback(err.stack, null)
        else
            callback(null, res.rows)
    })
}

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

exports.getAuthor = (id, callback) => {
    pool.query('SELECT id, name, surname, nickname FROM author WHERE id = $1 LIMIT 100', [id], (err, res) => {
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

//#region chapters methods

exports.putChapter = (manga_id, lang_id, title, volume, chapter, route, checksum, mail, callback) => {
    pool.query('INSERT INTO chapter(manga_id, lang_id, volume, chapter, title, file_path, checksum, mail) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, manga_id, lang_id, volume, chapter, title',
        [manga_id, lang_id, volume, chapter, title, route, checksum, mail], (err, res) => {
            if (err)
                callback(err.stack, null)
            else
                callback(null, res.rows)
        })
}

//#endregion

//#region status methods

exports.getStatus = (chapter, callback) => {
    pool.query('SELECT chapter_id, delivered, error, reason FROM status WHERE chapter_id = $1', [chapter], (err, res) => {
        if (err)
            callback(err.stack, null)
        else
            callback(null, res.rows)
    })
}

exports.setStatus = (chapter, delivered, error, reason, callback) => {
    pool.query('INSERT INTO status(chapter_id, delivered, error, reason) VALUES ($1, $2, $3, $4)', [chapter, delivered, error, reason], (err, res) => {
        if (err)
            callback(err.stack, null)
        else
            callback(null, res.rows)
    })
}

exports.editStatus = (chapter, delivered, error, reason, callback) => {
    pool.query('UPDATE status SET delivered = $1, error = $2, reason = $3 WHERE chapter_id = $4', [delivered, error, reason, chapter], (err, res) => {
        if (err)
            callback(err.stack, null)
        else
            callback(null, res.rows)
    })
}

//#endregion

//#region utils

exports.uuidExists = (uuid, callback) => {
    pool.query('SELECT COUNT(1) FROM manga WHERE uuid = $1', [uuid], (err, res) => {
        if (err)
            callback(err.stack, null)
        else
            callback(null, res.rows)
    })
}

exports.getLanguages = (callback) => {
    pool.query('SELECT * FROM language', (err, res) => {
        if (err)
            callback(err.stack, null)
        else
            callback(null, res.rows)
    })
}

//#endregion