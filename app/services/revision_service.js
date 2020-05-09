const fs = require('fs')
const path = require('path')
const Revision = require('../models/revision_model')

/*
* Import revision JSON files from local public directory into database.revisions
*/
const importRevisions = async () => {
    try {
        await Revision.deleteMany({})
        const revisionsPath = path.join(process.cwd(), 'public/data/revisions/')
        const revisionFiles = fs.readdirSync(revisionsPath)
        const totalProcess = revisionFiles.length
        let currentProcess = 0

        for (const filename of revisionFiles) {
            console.log(`Importing ${filename} ...`)
            await Revision.insertMany(require(revisionsPath + filename), {ordered: false})
            console.log(`Revision Imported(${++currentProcess}/${totalProcess}): ${filename}`)
        }
    } catch (err) {
        throw err
    }
}

module.exports = {
    importRevisions
}
