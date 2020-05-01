const fs = require('fs')
const path = require('path')
const async = require('async')
const Bot = require('@models/bot_model')
const Admin = require('@models/admin_model')
const Revision = require('@models/revision_model')

const importEditors = async (type) => {
    try {
        switch (type) {
            case 'bots':
                const botsFile = fs.readFileSync(path.join(process.cwd(), '/public/data/bots.txt'), 'utf8')
                // split the contents by lines
                const botsLines = botsFile.split(/\r?\n/)
                // construct bots data to import
                let bots = []
                botsLines.forEach(botName => {
                    if (botName !== '')
                        bots.push({name: botName, type: 'bot'})
                })
                // clear 'bots' collection, then import new bot names
                await Bot.deleteMany({})
                console.log('importing bots...')
                Bot.insertMany(bots)
                    .then(() => console.log('bots imported'))
                    .catch(err => {
                        return err
                    })
                break
            case 'admin':
                const adminFile = fs.readFileSync(path.join(process.cwd(), '/public/data/administrators.txt'), 'utf8')
                // split the contents by lines
                const adminLines = adminFile.split(/\r?\n/);
                // construct bots data to import
                let admins = []
                adminLines.forEach(adminName => {
                    if (adminName !== '')
                        admins.push({name: adminName, type: 'admin'})
                })
                // clear 'admins' collection, then import new bot names
                await Admin.deleteMany({})
                console.log('importing admins...')
                Admin.insertMany(admins)
                    .then(() => console.log('admins imported'))
                    .catch(err => {
                        return err
                    })
                break
            default:
                break
        }
    } catch (err) {
        throw err
    }
}

const importRevisions = async () => {
    try {
        await Revision.deleteMany({})
        const revisionsPath = path.join(process.cwd(), 'public/data/revisions/')
        const revisionFiles = fs.readdirSync(revisionsPath)
        const totalProcess = revisionFiles.length
        let currentProcess = 0

        // import revisions in parallel
        async.mapLimit(revisionFiles, 10, (filename, next) => {
            console.log(`Importing ${filename} ...`)
            Revision.insertMany(require(revisionsPath + filename))
                .then(() => {
                    console.log(`Revision Imported(${++currentProcess}/${totalProcess}): ${filename}`)
                    next()
                })
                .catch(err => {
                    return err
                })
        }).then(() => {
            console.log('All revisions import finished')
        }).catch(err => {
            throw err
        })

        /*, (err) => {
        if (err)
            throw err
        console.log('All revisions import finished')
    }*/
        /*const tasks = revisionFiles.map(async function(filename) {
            console.log(`Importing ${filename} ...`)
            Revision.insertMany(require(revisionsPath + filename))
                .then(() => console.log(`Revision Imported(${++currentProcess}/${totalProcess}): ${filename}`))
                .catch(err => {
                    return err
                })
        })
        await Promise.all(tasks)*/

        /*for (const filename of revisionFiles) {
            await Revision.insertMany(require(revisionsPath + filename))
            currentProcess++
            console.log(`Revision Imported(${currentProcess}/${totalProcess}): ${filename}`)
        }*/
    } catch (err) {
        throw err
    }


}

module.exports = {
    importEditors,
    importRevisions
}