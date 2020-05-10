/**
 * This module can unpack an epub, edit its metadata an repack it
 *
 * @author Eduardo Fernandez
 */

const fs = require('fs')
const path = require('path')
const rm = require('../utils/rm')
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
 * @param {String} epubName the name of the file we are opening
 * @returns {Promise} on resolve returns (json)
 */
exports.open = function (epubName) {
  return new Promise((resolve, reject) => {
    extractEpub(epubName)
      .then(() => parseOEBPS(epubName))
      .then((OEBPSJsonObj) => resolve(OEBPSJsonObj))
      .catch((err) => reject(err))
  })
}

/**
 * TODO: write documentation
 *
 * @param {JSON} json
 * @param {String} title
 * @param {String} serie
 * @param {Number} chapter
 * @param {String} author
 * @param {String} authorAs
 * @param {String} seriesIdentifier
 * @returns {Promise} on resolve returns ({ title, json })
 */
exports.editTags = function (json, title, serie, chapter, author, authorAs, seriesIdentifier) {
  return new Promise((resolve, reject) => {
    editJson(json, title, serie, chapter, author, authorAs, seriesIdentifier)
      .then((title, json) => resolve({ title, json }))
      .catch(err => reject(err))
  })
}

/**
 * TODO: write documentation
 *
 * @param {String} epubName
 * @param {String} title
 * @param {JSON} json
 * @returns {Promise} on resolve returns (finalName)
 */
exports.close = function (epubName, title, json) {
  return new Promise((resolve, reject) => {
    let finalFilename

    buildOEBPS(epubName, json)
      .then(() => compressEPUB(epubName, title))
      .then((filename) => {
        finalFilename = filename
        deleteTempFiles(epubName)
      })
      .then(() => resolve(finalFilename))
      .catch((err) => reject(err))
  })
}

/**
 * Does all the work in one
 *
 * @returns {Promise} on resolve returns (ebookFilename)
 */
exports.edit = function (epubName, title, serie, chapter, author, authorAs, seriesIdentifier) {
  return new Promise((resolve, reject) => {
    let OEBPSJsonObj, ebookFinalName

    extractEpub(epubName)
      .then(() => parseOEBPS(epubName))
      .then((oebpsObj) => editJson(oebpsObj, title, serie, chapter, author, authorAs, seriesIdentifier))
      .then((jsonObj) => {
        OEBPSJsonObj = jsonObj
        buildOEBPS(epubName, jsonObj)
      })
      .then(() => compressEPUB(epubName, OEBPSJsonObj.ebookTitle))
      .then((ebookFilePath) => {
        console.log(ebookFilePath)
        ebookFinalName = ebookFilePath
        deleteTempFiles(epubName)
      })
      .then(() => resolve(ebookFinalName))
      .catch((err) => {
        console.error(err)
        reject(err)
      })
  })
}

// Private vars/funtions

/**
 * Opens an epub.
 * It may be closed latelly.
 *
 * @param {String} epubName the name of the file we are opening
 * @returns {Promise} resolves when finished, does not return any value
 */
function extractEpub (epubName) {
  return new Promise((resolve, reject) => {
    let name

    // check if the epubName has the extension on it
    if (epubName.endsWith('.epub')) {
      name = epubName.substring(0, epubName.length - 5)
    } else {
      name = epubName
    }

    const zip = new AdmZip(name + '.epub')

    // cut epub path to only get the name
    name = name.substring(name.lastIndexOf('/') + 1)

    const filePath = path.join(process.env.TEMP_FOLDER, '/unziped_' + name)
    zip.extractAllTo(/* target path */filePath, /* overwrite */true)

    resolve()
  })
}

/**
 * Promise function. reads a OEBPS file
 *
 * @param {String} epubName the name of the epub file
 * @returns {Promise} OEBPS object (look at the content.opf inside)
 */
function parseOEBPS (epubName) {
  return new Promise((resolve, reject) => {
    let name

    // cut epub path to only get the name
    epubName = epubName.substring(epubName.lastIndexOf('/') + 1)

    // check if the epubName has the extension on it
    if (epubName.endsWith('.epub')) {
      name = epubName.substring(0, epubName.length - 5)
    } else {
      name = epubName
    }

    const filePath = path.join(process.env.TEMP_FOLDER, '/unziped_' + name, '/OEBPS/content.opf')
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        parseString(data, function (err, result) {
          if (err) {
            reject(err)
          } else {
            resolve(result)
          }
        })
      }
    })
  })
}

/**
 * TODO: write documentation
 *
 * @returns {Promise} on resolve returns ({ ebookTitle, json })
 */
function editJson (json, title, serie, chapter, author, authorAs, seriesIdentifier) {
  return new Promise((resolve, reject) => {
    if (json == null) {
      throw (new Error('JSON is undefined'))
    }

    // json.package.metadata[0]['dc:title'][0] = title + " - " + json.package.metadata[0]['dc:title'][0]
    json.package.metadata[0]['dc:title'][0] = title
    // json.package.metadata[0]['dc:title'][0] = title + " " + chapter;
    json.package.metadata[0]['dc:creator'][0] = { _: author, $: { 'opf:file-as': authorAs, 'opf:role': 'aut' } }
    json.package.metadata[0]['dc:contributor'][0]._ = process.env.MASTER_NAME + ' v' + require('../../package.json').version

    json.package.metadata[0].meta.push({ $: { property: 'belongs-to-collection', id: 'c01' }, _: serie })
    json.package.metadata[0].meta.push({ $: { refines: '#c01', property: 'collection-type' }, _: 'series' })
    json.package.metadata[0].meta.push({ $: { refines: '#c01', property: 'group-position' }, _: chapter })
    json.package.metadata[0].meta.push({ $: { refines: '#c01', property: 'dcterms:identifier' }, _: seriesIdentifier })

    const ebookTitle = json.package.metadata[0]['dc:title'][0] + ' - ' + author

    resolve({ ebookTitle, json })
  })
}

/**
 * Write the OBEPS object again to disk (Syncronous)
 *
 * @param {String} epubName file name
 * @param {Object} oebpsObj OEBPS object
 * @returns {Promise} resolves when finished, does not return any value
 */
function buildOEBPS (epubName, oebpsObj) {
  return new Promise((resolve, reject) => {
    const builder = new xml2js.Builder()
    const xml = builder.buildObject(oebpsObj.json)
    let name

    // cut epub path to only get the name
    epubName = epubName.substring(epubName.lastIndexOf('/') + 1)

    // check if the epubName has the extension on it
    if (epubName.endsWith('.epub')) {
      name = epubName.substring(0, epubName.length - 5)
    } else {
      name = epubName
    }

    const filePath = process.env.TEMP_FOLDER + '/unziped_' + name + '/OEBPS/content.opf'
    fs.writeFile(filePath, xml, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

/**
 * TODO: write documentation
 *
 * @returns {Promise} on resolve returns (ebookFilePath)
 */
function compressEPUB (epubName, ebookTitle) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '/../../output/', ebookTitle + '.epub')
    const outputStream = fs.createWriteStream(filePath)
    const zip = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    })
    let name

    // cut epub path to only get the name
    epubName = epubName.substring(epubName.lastIndexOf('/') + 1)

    // check if the epubName has the extension on it
    if (epubName.endsWith('.epub')) {
      name = epubName.substring(0, epubName.length - 5)
    } else {
      name = epubName
    }

    outputStream.on('close', function () {
      console.log(Math.round(((zip.pointer() / 1000) / 1000) * 100) / 100 + ' MB epub file saved') // print the mb saved
      resolve(ebookTitle + '.epub')
    })

    zip.on('error', function (err) {
      reject(err)
    })

    const folderPath = path.join(__dirname, '/../../', process.env.TEMP_FOLDER, '/unziped_' + name + '/')

    console.log(folderPath)
    zip.pipe(outputStream)
    zip.directory(folderPath, false)
    zip.finalize()
  })
}

/**
 * TODO: write documentation
 *
 * @returns {Promise} resolves when finished, does not return any value
 */
function deleteTempFiles (epubName) {
  return new Promise((resolve, reject) => {
    let name
    let comand

    console.log('deleting epub file')
    comand = epubName
    rm.rmrf(comand)

    // check if the epubName has the extension on it
    if (epubName.endsWith('.epub')) {
      name = epubName.substring(0, epubName.length - 5)
    } else {
      name = epubName
    }

    if (process.env.DELETE_INPUT) {
      console.log('deleting zip file')
      comand = name + '.zip'
      rm.rmrf(comand)
    }

    // cut epub path to only get the name
    name = name.substring(name.lastIndexOf('/') + 1)

    console.log('deleting unziped files')
    const filePath = path.join(__dirname, '/../../', process.env.TEMP_FOLDER, '/unziped_' + name)
    rm.rmrf(filePath)

    resolve()
  })
}
