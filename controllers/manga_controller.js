const data = require('../data/data')

exports.getManga = (req, res) => {
    if (req.query.search) {
        console.log('GET /manga called (search)')

        data.searchManga(req.query.search, (err, res2) => {
            if (err)
                res.status(503).json('Service Unavailable')
            else
                res.json(res2)
        })
    } else if (req.query.limit) {
        console.log('GET /manga called (limit)')

        data.getMangas(req.query.limit, (err, res2) => {
            if (err)
                res.status(503).json('Service Unavailable')
            else
                res.json(res2)
        })
    } else {
        console.log('GET /manga called')

        data.getMangas(null, (err, res2) => {
            if (err)
                res.status(503).json('Service Unavailable')
            else
                res.json(res2)
        })
    }
}

exports.putManga = (req, res) => {
    if (req.query.title && req.query.author_id) {
        console.log('PUT /manga called')

        do {
            req.query.uuid = 'urn:uuid:74357528-3935-2740-8282-' // TODO: add this to the .env
            req.query.uuid += Math.floor(Math.random() * (999999999999 - 100000000000) + 100000000000)
        } while (data.uuidExists(req.query.uuid))

        data.putManga(req.query.title, req.query.uuid, req.query.author_id, (err, res2) => {
            if (err)
                res.status(503).json('Service Unavailable')
            else
                res.json(res2)
        })
    } else {
        console.log('PUT /manga called (Bad Request)')

        res.status(400).json('Bad Request, Manga may have title and author identifier')
    }
}