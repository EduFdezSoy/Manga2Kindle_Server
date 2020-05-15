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
    data.lockProcess(queue.shift().chapter_id) // locked. To be processed
      .then((res) => {
        if (res) {
          ob.id = res.chapter_id
          ob.conversion_status = res.conversion_status

          return data.getChapter(res.chapter_id)
        } else {
          console.error(res)
          die()
        }
      })
      .then((res) => {
        ob.manga_id = res.manga_id
        ob.chapter = res.chapter
        ob.volume = res.volume
        ob.title = res.title
        ob.route = res.file_path
        ob.mail = res.mail
        ob.options = res.options
        ob.mail = res.mail

        return converter.enqueue(ob)
      })
      .catch(err => {
        if (err.message !== 'Already taken') {
          logger.error(err.message)
          console.error(err)
        }
      })
      .finally(() => {
        converterRunning = false
      })
  }
}
