/**
 * Module to manage sync to async work with Kindle Comic Converter (kcc)
 *
 * @author Eduardo Fernandez
 */

const { exec } = require('child_process')

/**
 * Converts the given folder to Epub
 * @param {String} folderName string to folder
 * @param {Array} options can be null (will pick default values)
 * @param {Function} callback Error or null
 */
exports.FolderToEpub = function (folderName, options) {
  return new Promise((resolve, reject) => {
    let style = 'manga' // can be manga, webtoon or comic (others = comic)
    let splitter = 0 // double page parsing mode. 0: Split 1: Rotate 2: Both

    // escape spaces in the path
    folderName = folderName.replace(/(\s+)/g, '\\$1')

    // TODO: let the user put some more options (device, 4panel...)
    if (options) {
      style = options.style ? options.style : style
      splitter = Number.isInteger(options.splitter) ? options.splitter : splitter
    }

    let comand = 'kcc-master/kcc-c2e.py -p KV'

    switch (style) {
      case 'manga':
        comand += ' -m'
        break

      case 'webtoon':
        comand += ' -w'
        break
    }

    comand += ' -2 -u -r ' + splitter + ' -f EPUB ' + folderName

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
