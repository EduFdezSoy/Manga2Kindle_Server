module.exports = function (app) {
  var manga = require('../controllers/manga_controller')
  var authors = require('../controllers/author_controller')
  var chapter = require('../controllers/chapter_controller')
  var lang = require('../controllers/lang_controller')
  var status = require('../controllers/status_controller')

  app.get('/', (req, res) => res.json(process.env.MASTER_NAME + ' v' + require('../package.json').version))

  app.get('/hello', (req, res) => res.json({
    name: process.env.MASTER_NAME,
    version: require('../package.json').version
  }))

  // #region MANGA ROUTES

  app.route('/manga')
    .get(manga.getManga)
    .put(manga.putManga)

  // #endregion

  // #region CHAPTER ROUTES

  app.route('/manga/chapter')
    .post(chapter.postChapter)

  // #endregion

  // #region AUTHOR ROUTES

  app.route('/author')
    .get(authors.getAuthor)
    .put(authors.putAuthor)

  // #endregion

  // status

  app.route('/status')
    .get(status.getStatus)
    .put(status.setError)

  // languaje
  app.route('/languages')
    .get(lang.getLanguages)
}
