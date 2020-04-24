const env = require('./env')

module.exports = {
    SESSION_KEY: env('SESSION_KEY', 'session_key'),
    SESSION_SECRET: env('SESSION_SECRET', 'secret'),
    SESSION_RESAVE: env('SESSION_RESAVE', false),
    SESSION_SAVEUNINITIALIZED: env('SESSION_SAVEUNINITIALIZED', false),
    SESSION_EXPIRES: env('SESSION_EXPIRES', '600000'),
}