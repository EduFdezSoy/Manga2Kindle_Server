require('dotenv').config()
const logger = require('./utils/logger')
const utils = require('./utils/utils')
const data = require('./data/data')
const ConvOb = require('./data/models/conversion_object')
const converter = require('./utils/converter')

let converterRunning = false
const waitTime = 5000
const queue = []

setInterval(enqueue, waitTime)

function enqueue () {
  data.getPendingProcesses()
    .then((res) => {
      res.forEach(element => {
        if (!utils.isInQueue(element, queue)) {
          queue.push(element)
        }
      })
    })
    .catch((err) => {
      console.error(err)
      logger.error(err.message)
    })

  // start converter
  if (!converterRunning && queue.length > 0) {
    converterRunning = true
    const ob = new ConvOb()
    ob.id = queue.shift().chapter_id

    ob.lock() // locked. To be processed
      .then((res) => ob.getDataFromDB())
      .then((res) => {
        return converter.enqueue(ob)
      })
      .then((res) => {
        converterRunning = false
      })
      .catch(err => {
        if (err.message !== 'Already taken') {
          logger.error(err.message)
          console.error(err)
        }

        converterRunning = false
      })
  }
}
