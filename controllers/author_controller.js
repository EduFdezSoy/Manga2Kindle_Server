const data = require('../data/data')

exports.getAuthor = (req, res) => {
    if (req.query.search) {
        console.log('GET /author called (search)')

        data.searchAuthor(req.query.search, (err, res2) => {
            if (err)
                res.status(503).json('Service Unavailable')
            else
                res.json(res2)
        })
    } else if (req.query.limit) {
        console.log('GET /author called (limit)')

        data.getAuthors(req.query.limit, (err, res2) => {
            if (err)
                res.status(503).json('Service Unavailable')
            else
                res.json(res2)
        })
    } else {
        console.log('GET /author called')

        data.getAuthors(null, (err, res2) => {
            if (err)
                res.status(503).json('Service Unavailable')
            else
                res.json(res2)
        })
    }
}

exports.putAuthor = (req, res) => {
    if (req.query.name && req.query.surname && req.query.nickname) {
        console.log('PUT /author called')

        data.putAuthor(req.query, (err, res2) => {
            if (err)
                res.status(503).json('Service Unavailable')
            else
                res.json(res2)
        })
    } else {
        console.log('PUT /author called (Bad Request)')

        res.status(400).json('Bad Request, Author may have name, surname and nickname')
    }
}