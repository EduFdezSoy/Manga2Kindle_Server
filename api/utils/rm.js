/**
 * Module to manage sync to async work with rm command
 *
 * @author Eduardo Fernandez
 */

const { exec } = require('child_process')

/**
 * Remove a file
 * @param {String} filePath
 * @param {Function} callback Error or null
 */
exports.rm = function (filePath) {
  return new Promise((resolve, reject) => {
    const comand = 'rm "' + filePath + '"'

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

/**
 * Remove a file or folder
 * with recursive and force options
 * @param {String} filePath
 * @param {Function} callback Error or null
 */
exports.rmrf = function (filePath) {
  return new Promise((resolve, reject) => {
    const comand = 'rm -rf "' + filePath + '"'

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
