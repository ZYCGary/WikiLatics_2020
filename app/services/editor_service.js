const fs = require('fs')
const path = require('path')
const Bot = require('@models/bot_model')
const Admin = require('@models/admin_model')

const importEditors = async (type) => {
    switch (type) {
        case 'bots':
            const botsFile = fs.readFileSync(path.join(process.cwd(), '/public/data/bots.txt'), 'utf8')
            // split the contents by lines
            const botsLines = botsFile.split(/\r?\n/);
            // construct bots data to import
            let bots = []
            botsLines.forEach(botName => {
                if (botName !== '')
                    bots.push({name: botName, type: 'bot'})
            })
            // clear 'bots' collection, then import new bot names
            await Bot.deleteMany({})
            await Bot.insertMany(bots)
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
            await Admin.insertMany(admins)
            break
        default:
            throw 'Invalid editor type'
    }
}

module.exports = {
    importEditors
}