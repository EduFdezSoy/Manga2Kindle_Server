const data = require('../data')

class ChapterForConverter {
  constructor (id, mangaId, chapter, volume, title, route, mail, options = '{}', conversionStatus) {
    this.id = id
    this.manga = {}
    this.manga.author = {}
    this.manga.id = mangaId
    this.chapter = chapter
    this.volume = volume
    this.title = title
    this.route = route
    this.mail = mail
    this.options = JSON.parse(options)
    this.conversion_status = conversionStatus
  }

  getDataFromDB () {
    return new Promise((resolve, reject) => {
      data.getChapter(this.id)
        .then((chapter) => {
          this.manga.id = chapter.manga_id
          this.chapter = chapter.chapter
          this.volume = chapter.volume
          this.title = chapter.title
          this.route = chapter.file_path
          this.mail = chapter.mail
          this.options = JSON.parse(chapter.options)
          this.mail = chapter.mail

          return data.getManga(this.manga.id)
        })
        .then((manga) => {
          this.manga = manga[0]
          return data.getAuthor(this.manga.author_id)
        })
        .then((author) => {
          delete this.manga.author_id
          this.manga.author = author[0]
          resolve()
        })
        .catch((err) => reject(err))
    })
  }

  lock () {
    return new Promise((resolve, reject) => {
      data.lockProcess(this.id)
        .then((status) => {
          this.conversion_status = status.conversion_status
          resolve()
        })
        .catch((err) => reject(err))
    })
  }
}

module.exports = ChapterForConverter
