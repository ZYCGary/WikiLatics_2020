const env = require('./env')

module.exports = {
    DB_HOST: env('DB_HOST', 'localhost'),
    DB_PORT: env('DB_PORT', '27017'),
    DB_USERNAME: env('DB_USERNAME', ''),
    DB_PASSWORD: env('DB_PASSWORD', ''),
    DB_DATABASE: env('DB_DATABASE', 'wikilatics'),
}