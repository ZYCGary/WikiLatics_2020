const env = require('./env')

module.exports = {
    APP_NAME: env('APP_NAME', 'WikiLatics'),
    APP_KEY: env('APP_KEY', 'privatekey'),
    APP_LOCALE: env('APP_LOCALE', 'en-au'),
    APP_ENV: env('NODE_ENV', 'dev'),
    PORT: env('PORT', '3000'),
};