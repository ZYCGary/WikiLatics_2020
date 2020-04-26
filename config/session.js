const env = require('./env')

module.exports = {
    SESSION_NAME: env('SESSION_NAME', 'connect.sid'),
    SESSION_SECRET: env('SESSION_SECRET', 'secret'),
    SESSION_RESAVE: env('SESSION_RESAVE', false) === 'true',
    SESSION_SAVEUNINITIALIZED: env('SESSION_SAVEUNINITIALIZED', false) === 'true',
    SESSION_MAXAGE: parseInt(env('SESSION_MAXAGE',900000)),
}