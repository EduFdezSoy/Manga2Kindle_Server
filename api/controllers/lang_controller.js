const data = require('../data/data')
const logger = require('../utils/logger')

exports.getLanguages = (req, res) => {
  data.getLanguages()
    .then((lags) => res.json(lags))
    .catch((err) => {
      logger.error(err.message)
      res.status(503).json('Service Unavailable')
    })
}
