const data = require('../data/data')

exports.getStatus = (req, res) => {
  data.getStatus(req.query.chapter_id)
    .then((status) => res.json(status))
    .catch((err) => {
      if (err.message === '400') {
        res.status(400).json('Bad Request, no chapter provided')
      } else {
        res.status(503).json('Service Unavailable')
      }
    })
}

exports.setError = (req, res) => {
  data.setError(req.query.chapter_id, req.query.delivered, req.query.error, req.query.reason)
    .then((status) => res.json(status))
    .catch((err) => {
      if (err.message === '400') {
        res.status(400).json('Bad Request')
      } else {
        res.status(503).json('Service Unavailable')
      }
    })
}
