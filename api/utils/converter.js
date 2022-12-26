/**
 * Instance it to convert and send a file
 * @author Eduardo Fernandez
 */

// dependencies
const path = require('path')
const { performance } = require('perf_hooks')
const data = require('../data/data')
const epubManager = require('../utils/epub_manager')
const kcc = require('../utils/kcc')
const kindlegen = require('../utils/kindlegen')
const rm = require('../utils/rm')
const emailer = require('../utils/emailer')
const logger = require('../utils/logger')

class Converter {
  constructor (id, mangaId, chapter, volume, title, route, mail, options = null) {
    this.id = id
    this.manga_id = mangaId
    this.chapter = chapter
    this.volume = volume
    this.title = title
    this.route = route
    this.mail = mail
    this.options = options
  }

  convert () {
    return new Promise((resolve, reject) => {
      let mangaOb, ebookFilePath, timer, totalTime
      timer = performance.now()

      kcc.FolderToEpub(this.route, this.options)
        .then((stdout) => data.getManga(this.manga_id))
        .then((resManga) => {
          mangaOb = resManga

          if (mangaOb == undefined) {
            mangaOb = {
              title: "",
            }

            let blankAuthor = {
              id: 0,
              name: "",
              surname: "",
              nickname: "",
            }

            return blankAuthor
          }

          return data.getAuthor(mangaOb.author_id)
        })
        .then((resAuthor) => {
          const epubName = formEpubFilename(this.route)
          const title = formEpubTitle(mangaOb.title, this.chapter, this.volume, this.title)
          const author = formAuthorName(resAuthor)
          const authorAs = formAuthorAs(resAuthor)

          // itadakimasu!  --  edit the epub, add lots of metadata and close it
          return epubManager.edit(epubName, title, mangaOb.title, this.chapter, author, authorAs, mangaOb.uuid)
        })
        .then((filename) => {
          ebookFilePath = path.join(__dirname, '/../../output/', filename)
          return kindlegen.EpubToMobi(ebookFilePath)
        })
        .then((stdout) => rm.rmrf(ebookFilePath))
        .then((stdout) => {
          const timeNow = performance.now()
          logger.verbose('chapter (%d) converted in %d seconds', this.id, (timeNow - timer) / 1000)
          totalTime = timeNow - timer
          timer = timeNow
          return emailer.sendFile(changeExtension(ebookFilePath), this.mail)
        })
        .then((info) => {
          const timeNow = performance.now() - timer
          logger.verbose('chapter (%d) sent in %d seconds (Total: %d)', this.id, timeNow / 1000, (timeNow + totalTime) / 1000)
          const status = info.response.substring(0, 2)
          if (status === '25') {
            return data.setError(this.id, true, false, null)
          } else {
            return data.setError(this.id, true, true, 'Chapter sent but failed: ' + info.response)
          }
        })
        .then((res) => resolve(res))
        .catch((err) => {
          console.error(err);
          reject(err)
        })
    })
  }
}

module.exports = Converter

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
