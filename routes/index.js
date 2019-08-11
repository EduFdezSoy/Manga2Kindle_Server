module.exports = function (app) {
    var manga = require('../controllers/manga_controller')
    var authors = require('../controllers/author_controller')
    var chapter = require('../controllers/chapter_controller')

    app.get('/', (req, res) => res.send('Hello World!'))

    //#region MANGA ROUTES

    app.route('/manga')
        .get(manga.getManga)
        .put(manga.putManga)

    //#endregion

    //#region CHAPTER ROUTES

    app.route('/manga/chapter')
        .get(chapter.getChapter)
        .put(chapter.putChapter)

    //#endregion

    //#region AUTHOR ROUTES

    app.route('/author')
        .get(authors.getAuthor)
        .put(authors.putAuthor)

    //#endregion

    // wildcall
    app.get('/:msg', (req, res) => res.json('Hello ' + req.params.msg))
}