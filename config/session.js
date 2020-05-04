module.exports = {
    SESSION_NAME: process.env.SESSION_NAME || 'connect.sid',
    SESSION_SECRET: process.env.SESSION_SECRET || 'secret',
    SESSION_RESAVE: process.env.SESSION_RESAVE === 'true' || false,
    SESSION_SAVEUNINITIALIZED: process.env.SESSION_SAVEUNINITIALIZED === 'true' || false,
    SESSION_MAXAGE: parseInt(process.env.SESSION_MAXAGE) || 900000,
}
