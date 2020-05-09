/**
 * Module to manage sync to async work with Amazon's kindlegen
 *
 * @author Eduardo Fernandez
 */

const { exec } = require('child_process')

/**
 * Converts the epub to mobi, it needs KindleGen to be installed in the right folder
 * @param {String} filePath
 * @param {Function} callback Error or null
 */
exports.EpubToMobi = function (filePath) {
  return new Promise((resolve, reject) => {
    // TODO: check if kindlegen is "installed"
    const comand = 'kindlegen/kindlegen -dont_append_source -locale en "' + filePath + '"'

    exec(comand, (error, stdout, stderr) => {
      if (error) {
        return reject(error)
      }
      if (stderr) {
        return reject(Error(stderr))
      }
      resolve(stdout)
    })
  })
}
