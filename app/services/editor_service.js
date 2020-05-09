const fs = require('fs')
const path = require('path')
const Bot = require('../models/bot_model')
const Admin = require('../models/admin_model')

/*
* Import bot authors and administrator author stored in .txt files into database.bots or database.admins
*/
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
                        throw err
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
                        throw err
                    })
                break
            default:
                break
        }
    } catch (err) {
        throw err
    }
}

module.exports = {
    importEditors
}
