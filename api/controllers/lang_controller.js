const data = require('../data/data')

exports.getLanguages = (req, res) => {
  data.getLanguages()
    .then((lags) => res.json(lags))
    .catch((err) => {
      console.error(err)
      res.status(503).json('Service Unavailable')
    })
}
