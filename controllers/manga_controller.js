const data = require('../data/data')

exports.getManga = (req, res) => {
    if (req.query.search) {
        console.log('GET /manga called (search)')

        data.searchManga(req.query.search, (err, res2) => {
            res.json(res2)
        })
    } else if (req.query.limit) {
        console.log('GET /manga called (limit)')

        data.getMangas(req.query.limit, (err, res2) => {
            res.json(res2)
        })
    } else {
        console.log('GET /manga called')

        data.getMangas(null, (err, res2) => {

            res.json(res2)
        })
    }
}

exports.putManga = (req, res) => {
    if (req.query.title && req.query.author_id) {
        console.log('PUT /manga called')

        data.putManga(req.query, (err, res2) => {
            res.json(res2)
        })
    } else {
        console.log('PUT /manga called (Bad Request)')

        res.status(400).json('Bad Request, Manga may have title and author identifier')
    }
}