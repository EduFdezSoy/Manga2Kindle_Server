/**
 * In this class we will call the dao with the values checked and return the objects formed as js objects
 */

const dao = require('./dao')

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

exports.getChapter = (id) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(new Error('A required param was null'))
    }

    dao.getChapter(id)
      .then((res) => resolve(res))
      .catch((err) => reject(err))
  })
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

exports.setStatus = (chapterId, delivered = false, error = false, reason) => {
  return new Promise((resolve, reject) => {
    delivered = parseBools(delivered)
    error = parseBools(error)

    dao.editStatus(chapterId, delivered, error, reason)
      .then((res) => resolve(res))
      .catch((err) => reject(err))
  })
}

exports.getPendingProcesses = () => {
  return dao.getPendingProcesses()
}

exports.getProcesses = (conversionStatus) => {
  return dao.getProcesses(conversionStatus)
}
exports.getProcess = (chapterId) => {
  return dao.getProcess(chapterId)
}

exports.setProcessStatus = (chapterId, conversionStatus) => {
  return dao.setProcessStatus(chapterId, conversionStatus)
}

exports.lockProcess = (chapterId) => {
  return new Promise((resolve, reject) => {
    if (!chapterId) {
      reject(new Error('A required param was null'))
    }

    dao.lockProcess(chapterId)
      .then((res) => {
        if (res.length > 0) {
          resolve(res[0])
        } else {
          reject(new Error('Already taken'))
        }
      })
      .catch((err) => reject(err))
  })
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
