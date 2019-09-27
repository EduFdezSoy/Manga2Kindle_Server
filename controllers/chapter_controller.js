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

                        data.setError(ob, (err, res) => { if (err) console.log(err) })
                    } else {
                        console.log('copied ' + req.body.route)

                        data.setStatus(id, false, false, null, (err, res) => { if (err) console.log(err) })
                        converter.FolderToEpub(req.body.route, (err) => {
                            if (err) {
                                console.log(err)
                                data.setError(id, false, true, err, (err, res) => { if (err) console.log(err) })
                            } else {
                                data.getManga(req.body.manga_id, (err, res6) => {
                                    if (err) {
                                        console.log(err)
                                        data.setError(id, false, true, err, (err, res) => { if (err) console.log(err) })
                                    } else {
                                        data.getAuthor(res6[0].author_id, (err, res8) => {
                                            if (err) {
                                                console.log(err)
                                                data.setError(id, false, true, err, (err, res) => { if (err) console.log(err) })
                                            } else {
                                                // epub name
                                                let epub_name = req.body.route
                                                if (epub_name.endsWith('.epub'))
                                                    epub_name = epub_name.substring(0, epub_name.length - 5)

                                                if (epub_name.endsWith('.zip'))
                                                    epub_name = epub_name.substring(0, epub_name.length - 4)

                                                epub_name += '.epub'

                                                // title
                                                let title = res6[0].title

                                                if (req.body.volume != null && req.body.volume != 0)
                                                    title += " Vol." + req.body.volume

                                                title += " Ch." + (req.body.chapter * 1).toString()

                                                if (req.body.title != "")
                                                    title += " - " + req.body.title

                                                // author
                                                author = res8[0].name + " " + res8[0].surname
                                                author_as = res8[0].surname + ", " + res8[0].name

                                                if (res8[0].surname == null || res8[0].surname == "") {
                                                    author = res8[0].name
                                                    author_as = res8[0].name
                                                }

                                                if (res8[0].name == null || res8[0].name == "") {
                                                    author = res8[0].surname
                                                    author_as = res8[0].name
                                                }

                                                if (res8[0].nickname != null && res8[0].nickname != "") {
                                                    if (author != "")
                                                        author += " (" + res8[0].nickname + ")"
                                                    else
                                                        author = res8[0].nickname

                                                    if (author_as != "")
                                                        author_as += " (" + res8[0].nickname + ")"
                                                    else
                                                        author_as = res8[0].nickname
                                                }

                                                // itadakimasu!
                                                epubManager.edit(epub_name, title, res6[0].title, req.body.chapter, author, author_as, res6[0].uuid, (filename, err) => {
                                                    if (err) {
                                                        console.info(err)
                                                    } else {
                                                        // convert to mobi
                                                        converter.EpubToMobi(filename, (err) => {
                                                            if (err) {
                                                                console.log(err)
                                                                data.setError(id, false, true, err, (err, res) => {
                                                                    if (err)
                                                                        console.log(err)
                                                                })
                                                            } else {
                                                                // remove extension and add new one
                                                                if (filename.endsWith('.epub'))
                                                                    filename = filename.substring(0, filename.length - 5)
                                                                filename += '.mobi'

                                                                // send to email
                                                                emailer.sendFile(__dirname + "/../output/" + filename, req.body.mail, (err, res) => {
                                                                    if (err) {
                                                                        console.info(err)
                                                                        data.setError(id, false, true, err.error, (err, res) => {
                                                                            if (err)
                                                                                console.log(err)
                                                                        })
                                                                    } else {
                                                                        let status = res.response.substring(0, 2)

                                                                        if (status == 25) {
                                                                            data.setError(id, true, false, null, (err, res) => { if (err) console.log(err) })
                                                                        } else {
                                                                            data.setError(id, true, true, res.response, (err, res) => {
                                                                                if (err)
                                                                                    console.log(err)
                                                                                else
                                                                                    console.log('Chapter send but failed')
                                                                            })
                                                                        }
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
} // and this is why node is called a callback hell