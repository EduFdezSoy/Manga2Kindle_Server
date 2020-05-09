const path = require('path')
const data = require('../data/data')
const converter = require('../utils/converter')
const epubManager = require('../utils/epub_manager')
const emailer = require('../utils/emailer')

/**
 * @param {Object} ob object formed with Converter.formConvObject()
 */
module.exports = function (ob, callback) {
  // convert file to epub
  converter.FolderToEpub(ob.route, ob.options, (err) => {
    if (err) {
      ifError(ob.id, err, callback, "Can't convert to Epub")
    } else {
      data.getManga(ob.manga_id, (err, resManga) => {
        if (err) {
          ifError(ob.id, err, callback, "Can't get the Manga")
        } else {
          data.getAuthor(resManga[0].author_id, (err, resAuthor) => {
            if (err) {
              ifError(ob.id, err, callback, "Can't get the Author")
            } else {
              const epubName = formEpubFilename(ob.route)
              const title = formEpubTitle(resManga[0].title, ob.chapter, ob.volume, ob.title)
              const author = formAuthorName(resAuthor[0])
              const authorAs = formAuthorAs(resAuthor[0])

              // itadakimasu!  --  edit the epub, add lots of metadata and close it
              epubManager.edit(epubName, title, resManga[0].title, ob.chapter, author, authorAs, resManga[0].uuid, (filename, err) => {
                if (err) {
                  ifError(ob.id, err, callback, "Can't edit the Epub")
                } else {
                  // convert to mobi
                  converter.EpubToMobi(filename, (err) => {
                    if (err) {
                      ifError(ob.id, err, callback, "Can't edit the Epub")
                    } else {
                      filename = changeExtension(filename)

                      // lets send this file!
                      const filePath = path.join(__dirname, '/../output/', filename)
                      emailer.sendFile(filePath, ob.mail, (err, resMail) => {
                        if (err) {
                          ifError(ob.id, err, callback, 'Something sending the manga failed')
                        } else {
                          const status = resMail.response.substring(0, 2)

                          if (status === '25') {
                            data.setError(ob.id, true, false, null, (err, res) => {
                              if (err) {
                                console.log(err)
                              }

                              callback(err, resMail)
                            })
                          } else {
                            data.setError(ob.id, true, true, 'Chapter sent but failed: ' + resMail.response, (err, res) => {
                              if (err) {
                                console.log(err)
                              } else {
                                console.log('Chapter sent but failed')
                              }

                              callback(err, resMail)
                            })
                          }
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  })
} // a truly horrible callback hell

// #region private functions

/**
 * This function logs the error
 * @param {Number} chapterId chapter's id
 * @param {Error} err Error
 * @param {Function} callback callback function (reason, res)
 * @param {String} msg message
 */
function ifError (chapterId, err, callback, msg = 'Error') {
  console.log(err)

  const reason = msg + ': ' + err.message
  data.setError(chapterId, false, true, reason, (err, res) => {
    if (err) {
      console.log(err)
    }

    callback(reason, res)
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
