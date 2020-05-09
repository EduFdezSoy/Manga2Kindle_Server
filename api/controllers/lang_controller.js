const data = require('../data/data')

exports.getLanguages = (req, res) => {
  data.getLanguages((err, res2) => {
    if (err) {
      res.status(503).json('Service Unavailable')
    } else {
      res.json(res2)
    }
  })
}
