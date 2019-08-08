module.exports = function (app) {
    // var buses = require('../controllers/appController');

    // // todoList Routes
    // app.route('/buses/bus/:codigo')
    //     .get(buses.getBus)
    //     .post(buses.getBus);

    var manga = require('../controllers/manga_controller')


    app.get('/', (req, res) => res.send('Hello World!'))
    app.get('/mangas', manga.getMangas)
    app.get('/manga/search/:str', manga.searchManga)
    app.get('/:msg', (req, res) => res.json('Hello ' + req.params.msg))
}