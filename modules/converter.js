/**
 * This module can convert a folder with images into a epub.
 * It can also convert from epub to mobi.
 * @author Eduardo Fernandez
 */

// dependencies
const shell = require('shelljs')

/**
 * TODO: write documentation
 * TODO: let the user put some options (device, 4panel...)
 * @param {Function} callback err or null
 */
exports.FolderToEpub = function (folderName, callback) {
    var comand = "kcc-master/kcc-c2e.py -p KV -m -2 -u -r 0 -f EPUB " + folderName

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
    var comand = "kindlegen/kindlegen -dont_append_source -locale en \"" + __dirname + "/output/" + file + "\""

    if (shell.exec(comand).code !== 0) {
        shell.exit(1)
        callback('kindlegen conversion failed')
    } else {
        callback(null)
    }
}
