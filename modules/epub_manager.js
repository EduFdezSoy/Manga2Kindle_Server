/**
 * This module can unpack an epub, edit its metadata an repack it
 * 
 * @author Eduardo Fernandez
 */

const fs = require('fs')
const shell = require('shelljs')
const AdmZip = require('adm-zip')
const archiver = require('archiver')
const xml2js = require('xml2js')
const parseString = require('xml2js').parseString
const dotenv = require('dotenv')
dotenv.config()

/**
 * This method opens an epub. 
 * It may be closed latelly.
 * 
 * TODO: update description
 * 
 * @param {String} epub_name the name of the file we are opening
 */
exports.open = function (epub_name, callback) {
    extractEpub(epub_name)
    parseOEBPS(epub_name)
        .then(json => {
            callback(json, null)
        })
        .catch(err => {
            callback(null, err)
        })
}

/**
 * TODO: write documentation
 */
exports.editTags = function (json, title, serie, chapter, author, author_as, series_identifier, callback) {
    editJson(json, title, serie, chapter, author, author_as, series_identifier)
        .then((title, json) => callback(title, json))
}

/**
 * TODO: write documentation
 */
exports.close = function (epub_name, title, json, callback) {
    buildOEBPS(epub_name, json)
    compressEPUB(epub_name, title)
        .then(filename => {
            deleteTempFiles(epub_name, filename, (err, final_name) => {
                if (err) {
                    callback(null, err)
                } else {
                    callback(final_name, null)
                }
            })
        })
        .catch(err => {
            callback(null, err)
        })
}

/**
 * Does all the work in one
 * 
 * @callback {Function} filename and error
 */
exports.edit = function (epub_name, title, serie, chapter, author, author_as, series_identifier, callback) {
    extractEpub(epub_name)
    parseOEBPS(epub_name, (err, json) => {
        if (err) {
            callback(null, err)
        } else {
            let obj = editJson(json, title, serie, chapter, author, author_as, series_identifier)
            buildOEBPS(epub_name, obj)
            compressEPUB(epub_name, obj.ebook_title, (err, final_name) => {
                if (err) {
                    callback(null, err)
                } else {
                    deleteTempFiles(epub_name, final_name, (err, final_name) => {
                        if (err) {
                            callback(null, err)
                        } else {
                            callback(final_name, null)
                        }
                    })
                }
            })
        }
    })
}

// Private vars/funtions

/**
* Opens an epub. 
* It may be closed latelly.
* 
* @param {String} epub_name the name of the file we are opening
*/
function extractEpub(epub_name) {
    let name;

    // check if the epub_name has the extension on it
    if (epub_name.endsWith('.epub')) {
        name = epub_name.substring(0, epub_name.length - 5)
    } else {
        name = epub_name
    }

    let zip = new AdmZip(name + '.epub')

    // cut epub path to only get the name
    name = name.substring(name.lastIndexOf('/') + 1)

    zip.extractAllTo(/*target path*/process.env.TEMP_FOLDER + '/unziped_' + name, /*overwrite*/true)
}

/**
 * Promise function. reads a OEBPS file
 * 
 * @param {String} epub_name the name of the epub file
 * @returns OEBPS object (look at the content.opf inside) or an error
 */
function parseOEBPS(epub_name, callback) {
    let name

    // cut epub path to only get the name
    epub_name = epub_name.substring(epub_name.lastIndexOf('/') + 1)

    // check if the epub_name has the extension on it
    if (epub_name.endsWith('.epub')) {
        name = epub_name.substring(0, epub_name.length - 5)
    } else {
        name = epub_name
    }

    fs.readFile(process.env.TEMP_FOLDER + "/unziped_" + name + "/OEBPS/content.opf", "utf-8", (err, data) => {
        if (err) {
            callback(err, null)
        } else {
            parseString(data, function (err, result) {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, result)
                }
            })
        }
    })
}

/**
 * TODO: write documentation
 */
function editJson(json, title, serie, chapter, author, author_as, series_identifier) {
    if (json == null) {
        throw ("JSON is undefined")
    }

    // json.package.metadata[0]['dc:title'][0] = title + " - " + json.package.metadata[0]['dc:title'][0]
    json.package.metadata[0]['dc:title'][0] = title;
    // json.package.metadata[0]['dc:title'][0] = title + " " + chapter;
    json.package.metadata[0]['dc:creator'][0] = { _: author, '$': { 'opf:file-as': author_as, 'opf:role': 'aut' } }
    json.package.metadata[0]['dc:contributor'][0]['_'] = process.env.MASTER_NAME + " v" + process.env.VERSION

    json.package.metadata[0].meta.push({ '$': { property: 'belongs-to-collection', id: 'c01' }, '_': serie })
    json.package.metadata[0].meta.push({ '$': { refines: '#c01', property: 'collection-type' }, '_': 'series' })
    json.package.metadata[0].meta.push({ '$': { refines: '#c01', property: 'group-position', }, '_': chapter })
    json.package.metadata[0].meta.push({ '$': { refines: '#c01', property: 'dcterms:identifier' }, '_': series_identifier })

    let ebook_title = json.package.metadata[0]['dc:title'][0] + " - " + author

    return { ebook_title, json }
}

/**
 * Write the OBEPS object again to disk (Syncronous)
 * 
 * @param {String} epub_name file name
 * @param {Object} oebpsObj OEBPS object
 */
function buildOEBPS(epub_name, oebpsObj) {
    let builder = new xml2js.Builder()
    let xml = builder.buildObject(oebpsObj.json)
    let name

    // cut epub path to only get the name
    epub_name = epub_name.substring(epub_name.lastIndexOf('/') + 1)

    // check if the epub_name has the extension on it
    if (epub_name.endsWith('.epub')) {
        name = epub_name.substring(0, epub_name.length - 5)
    } else {
        name = epub_name
    }

    fs.writeFileSync(process.env.TEMP_FOLDER + "/unziped_" + name + "/OEBPS/content.opf", xml)
}

/**
 * TODO: write documentation
 */
function compressEPUB(epub_name, ebook_title, callback) {
    let outputStream = fs.createWriteStream(__dirname + "/../output/" + ebook_title + ".epub")
    let zip = archiver('zip')
    let name

    // cut epub path to only get the name
    epub_name = epub_name.substring(epub_name.lastIndexOf('/') + 1)

    // check if the epub_name has the extension on it
    if (epub_name.endsWith('.epub')) {
        name = epub_name.substring(0, epub_name.length - 5)
    } else {
        name = epub_name
    }

    outputStream.on('close', function () {
        console.log(Math.round(((zip.pointer() / 1000) / 1000) * 100) / 100 + ' MB epub file saved'); // print the mb saved

        // // ==== CONVERT TO MOBI ====
        // try {
        //     converter.EpubToMobi(ebook_title + '.epub')
        // } catch (error) {
        //     deleteTempFiles()
        //     throw error
        // }
    })

    zip.on('close', function () {
        callback(null, ebook_title + '.epub')
    })

    zip.on('error', function (err) {
        callback(err, null)
    })

    zip.pipe(outputStream)
    zip.directory(process.env.TEMP_FOLDER + '/unziped_' + name + '/', false)
    zip.finalize()
}

/**
 * TODO: write documentation
 */
function deleteTempFiles(epub_name, final_name, callback) {
    let name

    console.log('trying to delete zip file')
    shell.rm('-rf', epub_name)

    // check if the epub_name has the extension on it
    if (epub_name.endsWith('.epub')) {
        name = epub_name.substring(0, epub_name.length - 5)
    } else {
        name = epub_name
    }

    console.log('trying to delete temp epub')
    shell.rm('-rf', name + '.epub')

    // cut epub path to only get the name
    epub_name = epub_name.substring(epub_name.lastIndexOf('/') + 1)

    console.log('trying to delete unziped files')
    shell.rm('-rf', __dirname + '/../' + process.env.TEMP_FOLDER + '/unziped_' + name)

    callback(null, final_name)
}