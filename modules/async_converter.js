var workerFarm = require('worker-farm')

class Converter {

    constructor() {
        this.worker = workerFarm(
            { maxConcurrentWorkers: 1 },
            require.resolve('./converter_for_worker')
        )
    }

    convert(conv_obj) {
        this.worker(conv_obj, (err, res) => {
            console.log(res)
            console.log(err)

            console.log("done?")
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