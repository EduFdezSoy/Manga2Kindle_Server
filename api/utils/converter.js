/**
 * This module can convert a folder with images into a epub.
 * It can also convert from epub to mobi.
 * @author Eduardo Fernandez
 */

// dependencies
const path = require('path')
const rm = require('../utils/rm')
const kcc = require('../utils/kcc')
const kindlegen = require('../utils/kindlegen')

/**
 * TODO: write documentation
 * TODO: let the user put some options (device, 4panel...)
 * @param {String} folderName string to folder
 * @param {Array} options can be null (will pick default values)
 * @param {Function} callback Error or null
 */
exports.FolderToEpub = function (folderName, options, callback) {
  kcc.FolderToEpub(folderName, options)
    .then((stdout) => callback(null, stdout))
    .catch((err) => callback(err, null))
}

/**
 * Converts the epub to mobi, it needs KindleGen to be installed in the right folder
 * @param {String} file
 * @param {Function} callback Error or null
 */
exports.EpubToMobi = function (file, callback) {
  const filePath = path.join(__dirname, '/../output/', file)

  kindlegen.EpubToMobi(filePath)
    .then((stdout) => rm.rmrf(filePath))
    .then((stdout) => callback(null, stdout))
    .catch((err) => callback(err, null))
}
