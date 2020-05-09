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
 */
exports.open = function (epubName, callback) {
  extractEpub(epubName)
  parseOEBPS(epubName)
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
exports.editTags = function (json, title, serie, chapter, author, authorAs, seriesIdentifier, callback) {
  editJson(json, title, serie, chapter, author, authorAs, seriesIdentifier)
    .then((title, json) => callback(title, json))
}

/**
 * TODO: write documentation
 */
exports.close = function (epubName, title, json, callback) {
  buildOEBPS(epubName, json)
  compressEPUB(epubName, title)
    .then(filename => {
      deleteTempFiles(epubName, filename, (err, finalName) => {
        if (err) {
          callback(null, err)
        } else {
          callback(finalName, null)
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
exports.edit = function (epubName, title, serie, chapter, author, authorAs, seriesIdentifier, callback) {
  extractEpub(epubName)
  parseOEBPS(epubName, (err, json) => {
    if (err) {
      callback(null, err)
    } else {
      const obj = editJson(json, title, serie, chapter, author, authorAs, seriesIdentifier)
      buildOEBPS(epubName, obj)
      compressEPUB(epubName, obj.ebookTitle, (err, finalName) => {
        if (err) {
          callback(null, err)
        } else {
          deleteTempFiles(epubName, finalName, (err, finalName) => {
            if (err) {
              callback(null, err)
            } else {
              callback(finalName, null)
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
* @param {String} epubName the name of the file we are opening
*/
function extractEpub (epubName) {
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
}

/**
 * Promise function. reads a OEBPS file
 *
 * @param {String} epubName the name of the epub file
 * @returns OEBPS object (look at the content.opf inside) or an error
 */
function parseOEBPS (epubName, callback) {
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
function editJson (json, title, serie, chapter, author, authorAs, seriesIdentifier) {
  if (json == null) {
    throw (new Error('JSON is undefined'))
  }

  // json.package.metadata[0]['dc:title'][0] = title + " - " + json.package.metadata[0]['dc:title'][0]
  json.package.metadata[0]['dc:title'][0] = title
  // json.package.metadata[0]['dc:title'][0] = title + " " + chapter;
  json.package.metadata[0]['dc:creator'][0] = { _: author, $: { 'opf:file-as': authorAs, 'opf:role': 'aut' } }
  json.package.metadata[0]['dc:contributor'][0]._ = process.env.MASTER_NAME + ' v' + require('../package.json').version

  json.package.metadata[0].meta.push({ $: { property: 'belongs-to-collection', id: 'c01' }, _: serie })
  json.package.metadata[0].meta.push({ $: { refines: '#c01', property: 'collection-type' }, _: 'series' })
  json.package.metadata[0].meta.push({ $: { refines: '#c01', property: 'group-position' }, _: chapter })
  json.package.metadata[0].meta.push({ $: { refines: '#c01', property: 'dcterms:identifier' }, _: seriesIdentifier })

  const ebookTitle = json.package.metadata[0]['dc:title'][0] + ' - ' + author

  return { ebookTitle, json }
}

/**
 * Write the OBEPS object again to disk (Syncronous)
 *
 * @param {String} epubName file name
 * @param {Object} oebpsObj OEBPS object
 */
function buildOEBPS (epubName, oebpsObj) {
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

  fs.writeFileSync(process.env.TEMP_FOLDER + '/unziped_' + name + '/OEBPS/content.opf', xml)
}

/**
 * TODO: write documentation
 */
function compressEPUB (epubName, ebookTitle, callback) {
  const filePath = path.join(__dirname, '/../output/', ebookTitle + '.epub')
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
    callback(null, ebookTitle + '.epub')
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
function deleteTempFiles (epubName, finalName, callback) {
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

  callback(null, finalName)
}
