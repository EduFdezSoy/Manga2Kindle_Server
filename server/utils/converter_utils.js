
exports.formEpubFilename = (route) => {
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

exports.formEpubTitle = (mangaTitle, chapter, volume, chapterTitle) => {
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

exports.formAuthorName = (authorOb) => {
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

exports.formAuthorAs = (authorOb) => {
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
exports.changeExtension = (filename) => {
  if (filename.endsWith('.epub')) {
    filename = filename.substring(0, filename.length - 5)
  }
  filename += '.mobi'

  return filename
}
