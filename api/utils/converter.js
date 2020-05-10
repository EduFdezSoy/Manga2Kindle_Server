/**
 * Instance it to convert and send a file
 * @author Eduardo Fernandez
 */

// dependencies
const path = require('path')
const data = require('../data/data')
const epubManager = require('../utils/epub_manager')
const kcc = require('../utils/kcc')
const kindlegen = require('../utils/kindlegen')
const rm = require('../utils/rm')
const emailer = require('../utils/emailer')

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
      kcc.FolderToEpub(this.route, this.options)
        .then((stdout) => {
          // TODO: log stdout as silly
          data.getManga(this.manga_id, (err, resManga) => {
            if (err) {
              ifError(this.id, err, "Can't get the Manga")
              reject(err)
              return
            }

            data.getAuthor(resManga[0].author_id, (err, resAuthor) => {
              if (err) {
                ifError(this.id, err, "Can't get the Author")
                reject(err)
                return
              }

              const epubName = formEpubFilename(this.route)
              const title = formEpubTitle(resManga[0].title, this.chapter, this.volume, this.title)
              const author = formAuthorName(resAuthor[0])
              const authorAs = formAuthorAs(resAuthor[0])

              let ebookFilePath

              // itadakimasu!  --  edit the epub, add lots of metadata and close it
              epubManager.edit(epubName, title, resManga[0].title, this.chapter, author, authorAs, resManga[0].uuid)
                .then((filename) => {
                  ebookFilePath = path.join(__dirname, '/../../output/', filename)
                  return kindlegen.EpubToMobi(ebookFilePath)
                })
                .then((stdout) => rm.rmrf(ebookFilePath))
                .then((stdout) => emailer.sendFile(changeExtension(ebookFilePath), this.mail))
                .then((info) => {
                  const status = info.response.substring(0, 2)
                  if (status === '25') {
                    data.setError(this.id, true, false, null, (err, res) => {
                      if (err) {
                        console.log(err)
                        reject(err)
                        return
                      }
                      resolve(info)
                    })
                  } else {
                    data.setError(this.id, true, true, 'Chapter sent but failed: ' + info.response, (err, res) => {
                      if (err) {
                        console.log(err)
                        reject(err)
                        return
                      }
                      resolve(info)
                    })
                  }
                })
                .catch((err) => reject(err))
            })
          })
        })
        .catch((err) => reject(err))
    })
  }
}

module.exports = Converter

// #region private functions

/**
 * This function logs the error
 * @param {Number} chapterId chapter's id
 * @param {Error} err Error
 * @param {Function} callback callback function (reason, res)
 * @param {String} msg message
 */
function ifError (chapterId, err, msg = 'Error') {
  console.log(err)

  const reason = msg + ': ' + err.message
  data.setError(chapterId, false, true, reason, (err, res) => {
    if (err) {
      console.log(err)
    }
  })
}

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
