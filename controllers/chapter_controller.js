const data = require('../data/data')

exports.postChapter = (req, res) => {
    // get current date
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0')
    let mm = String(today.getMonth() + 1).padStart(2, '0')
    let yyyy = today.getFullYear()
    today = '[' + dd + '-' + mm + '-' + yyyy + ']'

    // form the path and name
    req.body.route = __dirname + '/../files/' + req.files.file.md5.substring(0, 7) + '_' + today + '.zip'

    // check integrity
    if (req.files.file.md5 != req.body.checksum) {
        console.log('POST /manga/chapter called (Bad Request)')
        res.status(400).json('Bad Request, checksum mismatch')
    } else {
        console.log('POST /manga/chapter called')

        // insert chapter data
        data.putChapter(req.body.manga_id, req.body.lang_id, req.body.title, req.body.volume, req.body.chapter, req.body.route, req.body.checksum, req.body.mail, (err, res2) => {
            let id = res2[0].id

            if (err)
                res.status(503).json('Service Unavailable')
            else {
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
                    }
                    console.log('copied ' + req.body.route)
                    // TODO: process the file and update status table
                })
            }
        })
    }
}