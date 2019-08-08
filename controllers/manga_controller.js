const data = require('../data/data')

exports.getMangas = (req, res) => {
    console.log('route /mangas called')

    data.getMangas((err, res2) => {
        res.json(res2)
    })
}

exports.searchManga = (req, res) => {
    console.log('route /manga/search/' + req.params.str + ' called')

    data.searchManga(req.params.str, (err, res2) => {
        res.json(res2)
    })
}