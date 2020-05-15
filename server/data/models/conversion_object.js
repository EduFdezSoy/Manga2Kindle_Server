class Converter {
  constructor (id, mangaId, chapter, volume, title, route, mail, options, conversionStatus) {
    this.id = id
    this.manga_id = mangaId
    this.chapter = chapter
    this.volume = volume
    this.title = title
    this.route = route
    this.mail = mail
    this.options = options
    this.conversion_status = conversionStatus
  }
}

module.exports = Converter
