var workerFarm = require('worker-farm')
const data = require('../data/data')

class Converter {

    constructor() {
        this.worker = workerFarm(
            {
                maxCallsPerWorker: 1,
                maxConcurrentWorkers: 1,
                maxRetries: 3
                // maxCallTime: 75000
            },
            require.resolve('./converter_for_worker')
        )
    }

    convert(conv_obj) {
        this.worker(conv_obj, (err, res) => {
            if (err) {
                console.log(err)
                data.setError(conv_obj.id, false, true, "Error: " + err.message, (err, res) => {
                    if (err)
                        console.log(err)
                })
            }
        })
    }

    formConvObject(id, manga_id, chapter, volume, title, route, mail) {
        let ob = {
            id: id,
            manga_id: manga_id,
            chapter: chapter,
            volume: volume,
            title: title,
            route: route,
            mail: mail
        }

        return ob
    }

    close() {
        workerFarm.end(this.worker)
    }
}

class Singleton {

    constructor() {
        if (!Singleton.instance) {
            Singleton.instance = new Converter()
        }
    }

    getInstance() {
        return Singleton.instance
    }
}

module.exports = Singleton;