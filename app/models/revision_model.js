const mongoose = require('mongoose')

const collectionName = 'revisions'
const schema = {
    title: {
        type: String,
        required: true
    },
    user: String,
    timestamp: Date,
    anon: Boolean
}

const RevisionSchema = new mongoose.Schema(schema)
module.exports = mongoose.model(collectionName, RevisionSchema)