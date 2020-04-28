const mongoose = require('mongoose')

const collectionName = 'revisions'
const schema = {
    title: {
        type: String,
        required: true
    },
    revid: {
        type: Number,
        required: true,
        unique: true,
    },
    parentid: Number,
    minor: Boolean,
    user: String,
    userid: Number,
    timestamp: Date,
    size: Number,
    sha1: String,
    parsedcomment: String,
    anon: Boolean
}

const RevisionSchema = new mongoose.Schema(schema)
module.exports = mongoose.model(collectionName, RevisionSchema)