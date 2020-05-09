const express = require('express')
const router = express.Router()
const manga = require('../controllers/manga_controller')
const chapter = require('../controllers/chapter_controller')

router.route('/')
  .get(manga.getManga)
  .put(manga.putManga)

router.route('/chapter')
  .post(chapter.postChapter)

module.exports = router
