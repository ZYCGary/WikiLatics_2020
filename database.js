const mongoose = require("mongoose")
const DB = require('./config/database')

const dbhost = DB.DB_HOST
const dbport = DB.DB_PORT
const dbuser = DB.DB_USERNAME
const dbpassword = DB.DB_PASSWORD
const dbdatabase = DB.DB_DATABASE

const dbPath = "mongodb://" + (dbuser ? dbuser + ':' + dbpassword : '') + dbhost + (dbport ? ':' + dbport : '') + (dbdatabase ? '/' + dbdatabase : '')
mongoose.connect(dbPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(r => console.log("> successfully opened the database"))
    .catch(err => console.log("> error occurred from the database"))

module.exports = mongoose