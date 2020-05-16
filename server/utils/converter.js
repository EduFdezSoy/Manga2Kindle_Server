/**
 * Instance it to convert and send a file
 * @author Eduardo Fernandez
 */

const path = require('path')
const data = require('../data/data')
const epubManager = require('../utils/epub_manager')
const kcc = require('../utils/kcc')
const kindlegen = require('../utils/kindlegen')
const rm = require('../utils/rm')
const emailer = require('../utils/emailer')
const logger = require('../utils/logger')
const utils = require('../utils/converter_utils')
const ChapterForConverter = require('../data/models/conversion_object')
const conversioStatus = require('../data/models/conversion_status')

const queue = [ChapterForConverter]
const MAX_RETRIES = process.env.CONVERTER_MAX_RETRIES || 3

/**
 * @param {ChapterForConverter} chapOb
 */
exports.enqueue = (chapOb) => {
  return new Promise((resolve, reject) => {
    // we need to do this here since two instances of this running at the same time generates an exception
    kcc.FolderToEpub(chapOb.route, chapOb.options)
      .then((res) => data.setProcessStatus(chapOb.id, conversioStatus.EPUB_DONE))
      .then((res) => {
        chapOb.conversion_status = conversioStatus.EPUB_DONE
        queue.push(chapOb)
        resolve()
      })
      .catch((err) => reject(err))
  })
}

exports.run = () => {
  while (queue.length > 0) {
    const ob = queue.shift()

    switch (ob.conversion_status) {
      case conversioStatus.EPUB_DONE:
        // insert metadata
        insertMeta(ob)
        break
      case conversioStatus.META_DONE:
        // convert to mobi
        convertToMobi(ob)
        break
      case conversioStatus.MOBI_DONE:
        // send
        sendFile(ob)
        break
      case conversioStatus.SENT:
        // delete files
        removeFiles(ob)
        break
      case conversioStatus.DELETED:
        // mark as completed or errored
        setStatus(ob)
        break
      default:
        logger.error('Why is this in the queue', ob.id)
        console.log(ob)
        break
    }
  }
}

/**
 * @param {ChapterForConverter} ob
 */
function insertMeta (ob) {
  data.setProcessStatus(ob.id, conversioStatus.META_PROCESSING)
    .then((res) => {
      ob.conversion_status = conversioStatus.META_PROCESSING
      return epubManager.edit(
        utils.formEpubFilename(ob.route),
        utils.formEpubTitle(ob.manga.title, ob.chapter, ob.volume, ob.title),
        ob.manga.title,
        ob.chapter,
        utils.formAuthorName(ob.manga.author),
        utils.formAuthorAs(ob.manga.author),
        ob.manga.uuid
      )
    })
    .then((filename) => {
      ob.ebookFilePath = path.join(__dirname, '/../../output/', filename)
      return data.setProcessStatus(ob.id, conversioStatus.META_DONE)
    })
    .then((res) => {
      ob.conversion_status = conversioStatus.META_DONE
      // return the object to the queue
      queue.push(ob)
    })
    .catch((err) => error(ob, err))
}

function convertToMobi (ob) {
  data.setProcessStatus(ob.id, conversioStatus.MOBI_PROCESSING)
    .then((res) => {
      ob.conversion_status = conversioStatus.MOBI_PROCESSING
      return kindlegen.EpubToMobi(ob.ebookFilePath)
    })
    .then((res) => data.setProcessStatus(ob.id, conversioStatus.MOBI_DONE))
    .then((res) => {
      ob.conversion_status = conversioStatus.MOBI_DONE
      // return the object to the queue
      queue.push(ob)
    })
    .catch((err) => error(ob, err))
}

function sendFile (ob) {
  data.setProcessStatus(ob.id, conversioStatus.SENDING)
    .then((res) => {
      ob.conversion_status = conversioStatus.SENDING
      return emailer.sendFile(utils.changeExtension(ob.ebookFilePath), ob.mail)
    })
    .then((res) => {
      logger.verbose('chapter %d sent (%s)', ob.id, res.response)
      const status = res.response.substring(0, 2)
      if (status === '25') {
        return data.setProcessStatus(ob.id, conversioStatus.SENT)
      } else {
        throw (new Error('mail not sent RES: ' + res.response))
      }
    })
    .then((res) => {
      ob.conversion_status = conversioStatus.SENT

      // return the object to the queue
      queue.push(ob)
    })
    .catch((err) => error(ob, err))
}

function removeFiles (ob) {
  rm.rmrf(ob.ebookFilePath)
    .then((res) => rm.rmrf(utils.changeExtension(ob.ebookFilePath)))
    .then((res) => data.setProcessStatus(ob.id, conversioStatus.DELETED))
    .then((res) => {
      ob.conversion_status = conversioStatus.DELETED
      // return the object to the queue
      queue.push(ob)
    })
    .catch((err) => error(ob, err))
}

function setStatus (ob) {
  let error = false
  let delivered = false
  let reason = null

  if (ob.error >= MAX_RETRIES) {
    error = true
    reason = 'could not convert after ' + MAX_RETRIES + ' retries'
  } else {
    delivered = true
  }

  data.setStatus(ob.id, delivered, error, reason)
    .catch((err) => error(ob, err))
}

function error (ob, err) {
  if (ob.error++ < MAX_RETRIES) {
    logger.error('Error (chapter: %d, try: %d): ', ob.id, ob.error, err.message)
    console.error(err)
    // return to the previous step
    ob.conversion_status--
    // and add again to the queue
  } else {
    // we do this to mark it as failed in the database
    ob.conversion_status = conversioStatus.DELETED
  }
  queue.push(ob)
}
