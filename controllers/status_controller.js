const data = require('../data/data')

exports.getStatus = (req, res) => {
  data.getStatus(req.query.chapter_id, (err, res2) => {
    if (err === 400) {
      res.status(400).json('Bad Request, no chapter provided')
    } else if (err) {
      res.status(503).json('Service Unavailable')
    } else {
      res.json(res2)
    }
  })
}

exports.setError = (req, res) => {
  data.setError(req.query.chapter_id, req.query.delivered, req.query.error, req.query.reason, (err, res2) => {
    if (err === 400) {
      res.status(400).json('Bad Request')
    } else if (err) {
      res.status(503).json('Service Unavailable')
    } else {
      res.json(res2)
    }
  })
}
