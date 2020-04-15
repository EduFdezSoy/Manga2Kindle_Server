const data = require('../data/data')
const converter = require('../modules/converter')
const epubManager = require('../modules/epub_manager')
const emailer = require('../modules/emailer')

/**
 * @param {Object} ob object formed with Converter.formConvObject()
 */
module.exports = function (ob, callback) {
    // convert file to epub
    converter.FolderToEpub(ob.route, (err) => {
        if (err)
            ifError(ob.id, err, callback, "Can't convert to Epub")
        else {
            data.getManga(ob.manga_id, (err, res_manga) => {
                if (err)
                    ifError(ob.id, err, callback, "Can't get the Manga")
                else {
                    data.getAuthor(res_manga[0].author_id, (err, res_author) => {
                        if (err)
                            ifError(ob.id, err, callback, "Can't get the Author")
                        else {
                            let epub_name = formEpubFilename(ob.route)
                            let title = formEpubTitle(res_manga[0].title, ob.chapter, ob.volume, ob.title)
                            let author = formAuthorName(res_author[0])
                            let author_as = formAuthorAs(res_author[0])

                            // itadakimasu!  --  edit the epub, add lots of metadata and close it
                            epubManager.edit(epub_name, title, res_manga[0].title, ob.chapter, author, author_as, res_manga[0].uuid, (filename, err) => {
                                if (err)
                                    ifError(ob.id, err, callback, "Can't edit the Epub")
                                else {
                                    // convert to mobi
                                    converter.EpubToMobi(filename, (err) => {
                                        if (err)
                                            ifError(ob.id, err, callback, "Can't edit the Epub")
                                        else {
                                            filename = changeExtension(filename)

                                            // lets send this file!
                                            emailer.sendFile(__dirname + '/../output/' + filename, ob.mail, (err, res_mail) => {
                                                if (err)
                                                    ifError(ob.id, err, callback, "Something sending the manga failed")
                                                else {
                                                    let status = res_mail.response.substring(0, 2)

                                                    if (status == 25) {
                                                        data.setError(ob.id, true, false, null, (err, res) => {
                                                            if (err)
                                                                console.log(err)

                                                            callback(err, res_mail)
                                                        })
                                                    } else {
                                                        data.setError(ob.id, true, true, "Chapter sent but failed: " + res_mail.response, (err, res) => {
                                                            if (err)
                                                                console.log(err)
                                                            else
                                                                console.log('Chapter sent but failed')

                                                            callback(err, res_mail)
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
}   // a truly horrible callback hell

//#region private functions 

function ifError(chapter_id, err, callback, msg = "Error") {
    console.log(err)

    let reason = msg + ": " + err
    data.setError(chapter_id, false, true, reason, (err, res) => {
        if (err)
            console.log(err)

        callback(reason, res)
    })
}

function formEpubFilename(route) {
    let epub_name = route
    if (epub_name.endsWith('.epub'))
        epub_name = epub_name.substring(0, epub_name.length - 5)

    if (epub_name.endsWith('.zip'))
        epub_name = epub_name.substring(0, epub_name.length - 4)

    epub_name += '.epub'

    return epub_name
}

function formEpubTitle(manga_title, chapter, volume, chapter_title) {
    let title = manga_title

    if (volume != null && volume != 0)
        title += " Vol." + volume

    title += " Ch." + (chapter * 1).toString()

    if (chapter_title != "")
        title += " - " + chapter_title

    return title
}

function formAuthorName(author_ob) {
    let author = author_ob.name + " " + author_ob.surname

    if (author_ob.surname == null || author_ob.surname == "")
        author = author_ob.name

    if (author_ob.name == null || author_ob.name == "")
        author = author_ob.surname

    if (author_ob.nickname != null && author_ob.nickname != "")
        if (author != "")
            author += " (" + author_ob.nickname + ")"
        else
            author = author_ob.nickname

    return author
}

function formAuthorAs(author_ob) {
    let author_as = author_ob.surname + ", " + author_ob.name

    if (author_ob.surname == null || author_ob.surname == "")
        author_as = author_ob.name

    if (author_ob.name == null || author_ob.name == "")
        author_as = author_ob.name

    if (author_ob.nickname != null && author_ob.nickname != "")
        if (author_as != "")
            author_as += " (" + author_ob.nickname + ")"
        else
            author_as = author_ob.nickname

    return author_as
}

/**
 * Changes .epub to .mobi
 * 
 * @param {String} filename 
 */
function changeExtension(filename) {
    if (filename.endsWith('.epub'))
        filename = filename.substring(0, filename.length - 5)
    filename += '.mobi'

    return filename
}

//#endregion