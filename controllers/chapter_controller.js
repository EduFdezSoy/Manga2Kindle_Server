const data = require('../data/data')

exports.getChapter = (req, res) => {
    res.json("nice")
}

exports.postChapter = (req, res) => {
    console.log(req.files.chapter)
    req.files.chapter.mv(__dirname + '/../files/' + req.files.chapter.name, (err) => {
        if (err) {
            // TODO: notify err in status table
        }
        // TODO: process the file and update status table
    })
    // TODO: return manga data or error
    res.json("done")
}