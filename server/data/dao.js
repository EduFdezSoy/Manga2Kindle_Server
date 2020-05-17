/**
 * SQL ONLY, DONT DO SHIT HERE
 */

const { Pool } = require('pg')
const pool = new Pool()

// #region manga methods

exports.getManga = (id) => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT id, title, uuid, author_id FROM manga WHERE id = $1', [id])
      .then((res) => resolve(res.rows))
      .catch((err) => reject(err))
  })
}

exports.getChapter = (id) => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT manga_id, lang_id, volume, chapter, title, file_path, options, mail FROM chapter WHERE id = $1', [id])
      .then((res) => resolve(res.rows[0]))
      .catch((err) => reject(err))
  })
}

exports.getAuthor = (id) => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT id, name, surname, nickname FROM author WHERE id = $1', [id])
      .then((res) => resolve(res.rows))
      .catch((err) => reject(err))
  })
}

// #endregion

// #region status methods

exports.getPendingProcesses = () => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT chapter_id, conversion_status FROM status WHERE conversion_status = 1 ORDER BY chapter_id ASC')
      .then((res) => resolve(res.rows))
      .catch((err) => reject(err))
  })
}

exports.getProcesses = (conversionStatus) => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT chapter_id, conversion_status FROM status WHERE conversion_status = $1 ORDER BY chapter_id ASC', [conversionStatus])
      .then((res) => resolve(res.rows))
      .catch((err) => reject(err))
  })
}

exports.getProcess = (chapter) => {
  return new Promise((resolve, reject) => {
    pool.query('SELECT chapter_id, conversion_status FROM status WHERE chapter_id = $1', [chapter])
      .then((res) => resolve(res.rows[0]))
      .catch((err) => reject(err))
  })
}

exports.lockProcess = (chapter) => {
  return new Promise((resolve, reject) => {
    pool.query('UPDATE status SET conversion_status = 2 WHERE chapter_id = $1 and conversion_status = 1 returning id, chapter_id, delivered, error, reason, conversion_status', [chapter])
      .then((res) => resolve(res.rows))
      .catch((err) => reject(err))
  })
}

exports.setProcessStatus = (chapter, conversionStatus) => {
  return new Promise((resolve, reject) => {
    pool.query('UPDATE status SET conversion_status = $1 WHERE chapter_id = $2', [conversionStatus, chapter])
      .then((res) => resolve(res.rows))
      .catch((err) => reject(err))
  })
}

exports.editStatus = (chapter, delivered, error, reason) => {
  return new Promise((resolve, reject) => {
    pool.query('UPDATE status SET delivered = $1, error = $2, reason = $3 WHERE chapter_id = $4', [delivered, error, reason, chapter])
      .then((res) => resolve(res.rows))
      .catch((err) => reject(err))
  })
}

// #endregion
