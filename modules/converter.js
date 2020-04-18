/**
 * This module can convert a folder with images into a epub.
 * It can also convert from epub to mobi.
 * @author Eduardo Fernandez
 */

// dependencies
const shell = require('shelljs')
const path = require('path')

/**
 * TODO: write documentation
 * TODO: let the user put some options (device, 4panel...)
 * @param {String} folderName string to folder
 * @param {Array} options can be null (will pick default values)
 * @param {Function} callback err or null
 */
exports.FolderToEpub = function (folderName, options, callback) {
  let style = 'manga' // can be manga, webtoon or comic (others = comic)
  let splitter = 0 // double page parsing mode. 0: Split 1: Rotate 2: Both

  if (options) {
    style = options.style ? options.style : style
    splitter = options.splitter ? options.splitter : splitter
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

  if (shell.exec(comand).code !== 0) {
    shell.exit(1)
    callback('kcc: conversion to epub failed')
  } else {
    callback(null)
  }
}

/**
 * Converts the epub to mobi, it needs KindleGen to be installed in the right folder
 * @param {String} file
 * @param {Function} callback err or null
 */
exports.EpubToMobi = function (file, callback) {
  // TODO: check if kindlegen is "installed"
  const filePath = path.join(__dirname, '/../output/', file)
  const comand = 'kindlegen/kindlegen -dont_append_source -locale en "' + filePath + '"'
  if (shell.exec(comand).code !== 0) {
    shell.exit(1)
    callback('kindlegen conversion failed')
  } else {
    callback(null)
  }
  console.log('deleting epub')
  shell.rm('-rf', filePath)
}
