const data = require('../data/data')
const converter = require('../modules/converter')
const epubManager = require('../modules/epub_manager')
const emailer = require('../modules/emailer')

exports.postChapter = (req, res) => {
    // get current date
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0')
    let mm = String(today.getMonth() + 1).padStart(2, '0')
    let yyyy = today.getFullYear()
    today = '[' + dd + '-' + mm + '-' + yyyy + ']'

    // form the path and name
    req.body.route = __dirname + '/../files/' + req.files.file.md5.substring(0, 7) + '_' + today + '.zip'

    // for some reason I can see right now the checksum and title and the mail to comes between ""
    req.body.checksum = req.body.checksum.substring(1, req.body.checksum.length - 1)
    req.body.title = req.body.title.substring(1, req.body.title.length - 1)
    req.body.mail = req.body.mail.substring(1, req.body.mail.length - 1)

    // check integrity
    if (req.files.file.md5 != req.body.checksum) {
        console.log('POST /manga/chapter called (Bad Request)')
        res.status(400).json('Bad Request, checksum mismatch')
    } else {
        console.log('POST /manga/chapter called')

        // insert chapter data
        data.putChapter(req.body.manga_id, req.body.lang_id, req.body.title, req.body.volume, req.body.chapter, req.body.route, req.body.checksum, req.body.mail, (err, res2) => {
            if (err)
                res.status(503).json('Service Unavailable')
            else {
                let id = res2[0].id

                // return chapter data
                res.json(res2)

                req.files.file.mv(req.body.route, (err) => {
                    if (err) {
                        console.log(err)

                        let ob
                        ob.chapter_id = id
                        ob.delivered = false
                        ob.error = true
                        ob.reason = 'unable to move: ' + err

                        data.setError(ob, (err, res) => {
                            if (err)
                                console.log(err)
                            else
                                console.log(res)
                        })
                    } else {
                        console.log('copied ' + req.body.route)

                        data.setStatus(id, delivered = false, error = false, reason = null, (err, res) => {
                            if (err)
                                console.log(err)
                            else
                                console.log(res)
                        })
                        converter.FolderToEpub(req.body.route, (err) => {
                            if (err) {
                                console.log(err)
                                data.setError(id, delivered = false, error = true, err, (err, res) => {
                                    if (err)
                                        console.log(err)
                                    else
                                        console.log(res)
                                })
                            } else {
                                console.log("its working.. for now")
                            }
                        })
                    }
                })
            }
        })
    }
}