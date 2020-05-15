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
const ConvOb = require('../data/models/conversion_object')
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
        epubName = formEpubFilename(convOb.route)
        title = formEpubTitle(mangaOb.title, convOb.chapter, convOb.volume, convOb.title)
        author = formAuthorName(resAuthor[0])
        authorAs = formAuthorAs(resAuthor[0])

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
        return emailer.sendFile(changeExtension(ebookFilePath), convOb.mail)
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

exports.convert = (conversionObject) => {
  return new Promise((resolve, reject) => {
    let mangaOb, ebookFilePath, timer, totalTime
    timer = performance.now()

    kcc.FolderToEpub(conversionObject.route, conversionObject.options)
      .then((stdout) => data.getManga(conversionObject.manga_id))
      .then((resManga) => {
        mangaOb = resManga[0]
        return data.getAuthor(mangaOb.author_id)
      })
      .then((resAuthor) => {
        const epubName = formEpubFilename(conversionObject.route)
        const title = formEpubTitle(mangaOb.title, conversionObject.chapter, conversionObject.volume, conversionObject.title)
        const author = formAuthorName(resAuthor[0])
        const authorAs = formAuthorAs(resAuthor[0])

        // itadakimasu!  --  edit the epub, add lots of metadata and close it
        return epubManager.edit(epubName, title, mangaOb.title, conversionObject.chapter, author, authorAs, mangaOb.uuid)
      })
      .then((filename) => {
        ebookFilePath = path.join(__dirname, '/../../output/', filename)
        return kindlegen.EpubToMobi(ebookFilePath)
      })
      .then((stdout) => rm.rmrf(ebookFilePath))
      .then((stdout) => {
        const timeNow = performance.now()
        logger.verbose('chapter (%d) converted in %d seconds', conversionObject.id, (timeNow - timer) / 1000)
        totalTime = timeNow - timer
        timer = timeNow
        return emailer.sendFile(changeExtension(ebookFilePath), conversionObject.mail)
      })
      .then((info) => {
        const timeNow = performance.now() - timer
        logger.verbose('chapter (%d) sent in %d seconds (Total: %d)', conversionObject.id, timeNow / 1000, (timeNow + totalTime) / 1000)
        const status = info.response.substring(0, 2)
        if (status === '25') {
          return data.setError(conversionObject.id, true, false, null)
        } else {
          return data.setError(conversionObject.id, true, true, 'Chapter sent but failed: ' + info.response)
        }
      })
      .then((res) => resolve(res))
      .catch((err) => reject(err))
  })
}

// #region private functions

function formEpubFilename (route) {
  let epubName = route
  if (epubName.endsWith('.epub')) {
    epubName = epubName.substring(0, epubName.length - 5)
  }

  if (epubName.endsWith('.zip')) {
    epubName = epubName.substring(0, epubName.length - 4)
  }

  epubName += '.epub'

  return epubName
}

function formEpubTitle (mangaTitle, chapter, volume, chapterTitle) {
  let title = mangaTitle

  if (volume != null && volume !== 0) {
    title += ' Vol.' + volume
  }

  title += ' Ch.' + (chapter * 1).toString()

  if (chapterTitle !== '') {
    title += ' - ' + chapterTitle
  }

  return title
}

function formAuthorName (authorOb) {
  let author = authorOb.name + ' ' + authorOb.surname

  if (authorOb.surname == null || authorOb.surname === '') {
    author = authorOb.name
  }

  if (authorOb.name == null || authorOb.name === '') {
    author = authorOb.surname
  }

  if (authorOb.nickname != null && authorOb.nickname !== '') {
    if (author !== '') {
      author += ' (' + authorOb.nickname + ')'
    } else {
      author = authorOb.nickname
    }
  }

  return author
}

function formAuthorAs (authorOb) {
  let authorAs = authorOb.surname + ', ' + authorOb.name

  if (authorOb.surname == null || authorOb.surname === '') {
    authorAs = authorOb.name
  }

  if (authorOb.name == null || authorOb.name === '') {
    authorAs = authorOb.name
  }

  if (authorOb.nickname != null && authorOb.nickname !== '') {
    if (authorAs !== '') {
      authorAs += ' (' + authorOb.nickname + ')'
    } else {
      authorAs = authorOb.nickname
    }
  }

  return authorAs
}

/**
 * Changes .epub to .mobi
 *
 * @param {String} filename
 */
function changeExtension (filename) {
  if (filename.endsWith('.epub')) {
    filename = filename.substring(0, filename.length - 5)
  }
  filename += '.mobi'

  return filename
}

// #endregion
