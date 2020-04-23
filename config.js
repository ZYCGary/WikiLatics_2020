const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    app_name: process.env.APP_NAME,
    app_locale: process.env.APP_LOCALE,
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    db_url: process.env.DB_URL
};