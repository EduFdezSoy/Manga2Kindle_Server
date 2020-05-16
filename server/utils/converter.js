/**
 * Instance it to convert and send a file
 * @author Eduardo Fernandez
 */

const path = require('path')
const { performance } = require('perf_hooks')
const data = require('../data/data')
const epubManager = require('../utils/epub_manager')
const kcc = require('../utils/kcc')
const kindlegen = require('../utils/kindlegen')
const rm = require('../utils/rm')
const emailer = require('../utils/emailer')
const logger = require('../utils/logger')
const utils = require('../utils/converter_utils')
const conversioStatus = require('../data/models/conversion_status')

const queue = []

/**
 * @param {ConvOb} conversionObject
 */
exports.enqueue = (convOb) => {
  return new Promise((resolve, reject) => {
    let mangaOb, ebookFilePath, timer, totalTime, epubName, title, author, authorAs
    queue.push(convOb)
    timer = performance.now()

    kcc.FolderToEpub(convOb.route, convOb.options)
      .then((res) => data.setProcessStatus(convOb.id, conversioStatus.EPUB_DONE)) // TODO: add statuses to all processes in this file
      .then((res) => {
        resolve(res)
        return data.setProcessStatus(convOb.id, conversioStatus.META_PROCESSING)
      })
      .then((res) => data.getManga(convOb.manga_id))
      .then((resManga) => {
        mangaOb = resManga[0]
        return data.setProcessStatus(convOb.id, conversioStatus.META_DONE)
      })
      .then((res) => data.getAuthor(mangaOb.author_id))
      .then((resAuthor) => {
        epubName = utils.formEpubFilename(convOb.route)
        title = utils.formEpubTitle(mangaOb.title, convOb.chapter, convOb.volume, convOb.title)
        author = utils.formAuthorName(resAuthor[0])
        authorAs = utils.formAuthorAs(resAuthor[0])

        return data.setProcessStatus(convOb.id, conversioStatus.META_DONE)
      })
      // itadakimasu!  --  edit the epub, add lots of metadata and close it
      .then((res) => epubManager.edit(epubName, title, mangaOb.title, convOb.chapter, author, authorAs, mangaOb.uuid))
      .then((filename) => {
        ebookFilePath = path.join(__dirname, '/../../output/', filename)
        data.setProcessStatus(convOb.id, conversioStatus.MOBI_PROCESSING)
      })
      .then((res) => kindlegen.EpubToMobi(ebookFilePath))
      .then((stdout) => data.setProcessStatus(convOb.id, conversioStatus.MOBI_DONE))
      .then((res) => rm.rmrf(ebookFilePath))
      .then((stdout) => data.setProcessStatus(convOb.id, conversioStatus.SENDING))
      .then((res) => {
        const timeNow = performance.now()
        logger.verbose('chapter (%d) converted in %d seconds', convOb.id, (timeNow - timer) / 1000)
        totalTime = timeNow - timer
        timer = timeNow
        return emailer.sendFile(utils.changeExtension(ebookFilePath), convOb.mail)
      })
      .then((info) => {
        const timeNow = performance.now() - timer
        logger.verbose('chapter (%d) sent in %d seconds (Total: %d)', convOb.id, timeNow / 1000, (timeNow + totalTime) / 1000)
        const status = info.response.substring(0, 2)
        if (status === '25') {
          return data.setError(convOb.id, true, false, null)
        } else {
          return data.setError(convOb.id, true, true, 'Chapter sent but failed: ' + info.response)
        }
      })
      .then((res) => data.setProcessStatus(convOb.id, conversioStatus.SENT))
      // its actually deleted as the same time it is sent, may change in the future
      .then((stdout) => data.setProcessStatus(convOb.id, conversioStatus.DELETED))
      .then((res) => resolve(res))
      .catch((err) => reject(err))
  })
}
