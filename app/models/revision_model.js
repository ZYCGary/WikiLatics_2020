const mongoose = require('mongoose')

const collectionName = 'revisions'
const schema = {

}

const RevisionSchema = new mongoose.Schema(schema)
module.exports = mongoose.model(collectionName, RevisionSchema)