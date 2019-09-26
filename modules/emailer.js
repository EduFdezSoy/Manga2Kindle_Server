/**
 * This module is the one in charge of the emails
 * it sends the files and the errors 
 * 
 * @author Eduardo Fernandez
 */

const nodemailer = require('nodemailer')
const rimraf = require("rimraf")
const dotenv = require('dotenv')
dotenv.config()

var transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
})

//#region module public methods

/**
 * TODO: write method documentation
 * 
 * @param {String} file
 * @param {String} mail_to
 * @param {Function} callback optional
 */
exports.sendFile = function (file, mail_to, callback = null) {
    if (callback == null) {
        sendEbook(file, mail_to, () => {
            console.log("file sended.")
        })
    } else {
        sendEbook(file, mail_to, callback)
    }
}

/**
 * TODO: write method documentation
 * 
 * @param {String} msg
 * @param {String} err
 */
exports.sendErrorMail = function (msg, err) {
    msg = msg + "\n\n" + err.stack
    sendEmail("An Error Ocurred", msg)
}

//#endregion

//#region functions

/**
 * TODO: write method documentation
 * 
 * @param {String} file 
 * @param {String} mail_to 
 * @param {Function} callback 
 */
function sendEbook(file, mail_to, callback) {
    var mailOptions = {
        from: process.env.MAIL_SENDER,
        to: mail_to,
        subject: "[Manga2Kindle] Here is your Manga!",
        text: "I'm here again to deliver your manga!\n You will find it attached to this email.\n -- The Manga2Kindle Bot",
        html: "Hey there!<br><br>I'm here again to deliver your manga!<br>You can find it attached to this email.<br><br> <i>Bop Bee Boo,</i><br>The Manga2Kindle Bot",
        attachments: {
            path: file
        }
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Unable send the email: ' + error)
        }

        rimraf(file, function () {
            console.log("Email sent: " + info.response + " - file deleted (" + file + ")")
            callback()
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
function sendEmail(subject, message) {
    if (process.env.MAIL_ENABLED) {
        var mailOptions = {
            from: process.env.MAIL_SENDER,
            to: process.env.MAIL_TO,
            subject: "[Manga2Kindle] " + subject,
            text: message
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error(error)
            } else {
                console.log("Email sent: " + info.response)
            }
        })
    }
}

//#endregion