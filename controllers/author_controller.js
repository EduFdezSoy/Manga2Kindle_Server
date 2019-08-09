const data = require('../data/data')

exports.getAuthors = (req, res) => {
    console.log('route /authors called')

    data.getMangas((err, res2) => {
        res.json(res2)
    })
}