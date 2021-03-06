/**
 * This module is the one in charge of the emails
 * it sends the files and the errors
 *
 * @author Eduardo Fernandez
 */

const nodemailer = require('nodemailer')
const rm = require('../utils/rm')
const logger = require('../utils/logger')
const dotenv = require('dotenv')
dotenv.config()

var transporter = generateTransporter()

// #region module public methods

/**
 * TODO: write method documentation
 *
 * @param {String} file
 * @param {String} mailTo
 * @returns {Promise} on resolve returns (info)
 */
exports.sendFile = function (file, mailTo) {
  return new Promise((resolve, reject) => {
    sendEbook(file, mailTo, (err, res) => {
      if (err) {
        reject(err)
        return
      }
      resolve(res)
      logger.silly('file sended.')
    })
  })
}

/**
 * TODO: write method documentation
 *
 * @param {String} msg
 * @param {Error} err
 */
exports.sendErrorMail = function (msg, err) {
  msg = msg + '\n\n' + err.stack
  sendEmail('An Error Ocurred', msg)
}

// #endregion

// #region functions

/**
 * TODO: write method documentation
 *
 * @param {String} file
 * @param {String} mailTo
 * @param {Function} callback (err, res)
 */
function sendEbook (file, mailTo, callback) {
  var mailOptions = {
    from: process.env.MAIL_SENDER,
    to: mailTo,
    subject: '[Manga2Kindle] Here is your Manga!',
    text: "I'm here again to deliver your manga!\n You will find it attached to this email.\n -- The Manga2Kindle Bot",
    html: "Hey there!<br><br>I'm here again to deliver your manga!<br>You can find it attached to this email.<br><br> <i>Bop Bee Boo,</i><br>The Manga2Kindle Bot",
    attachments: {
      path: file
    }
  }

  if (process.env.MAIL_REPLY_TO && process.env.MAIL_REPLY_TO !== '') {
    mailOptions.replyTo = process.env.MAIL_REPLY_TO
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      logger.error('Unable send the email: ' + error.message)
      callback(error, null)
    }

    rm.rmrf(file)
      .then(res => {
        logger.verbose('Email sent: ' + info.response + ' - file deleted (' + file + ')')
        callback(error, info)
      })
      .catch(err => {
        logger.error(err.message)
        callback(err, null)
      })
  })
}

/**
 * This method sends a mail to the default mailbox
 * it may be used to report errors and stats
 *
 * @param {String} subject Mail subject
 * @param {String} message Mail body (text only)
 */
function sendEmail (subject, message) {
  if (process.env.MAIL_ENABLED) {
    var mailOptions = {
      from: process.env.MAIL_SENDER,
      to: process.env.MAIL_TO,
      subject: '[Manga2Kindle] ' + subject,
      text: message
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        logger.error(error.message)
      } else {
        logger.verbose('Email sent: ' + info.response)
      }
    })
  }
}

/**
 * Generate the transport object needed to send mails
 *
 * @returns returns a Transport object created by nodemailer.createTransport()
 */
function generateTransporter () {
  if (process.env.MAIL_SERVICE.toLowerCase() === 'gmail') {
    const transporter = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
      }
    })

    return transporter
  } else if (process.env.MAIL_SERVICE.toLowerCase() === 'smtp') {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: process.env.MAIL_SECURE,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
      }
    })

    return transporter
  } else {
    throw Error('The mail service is not recognised')
  }
}

// #endregion
