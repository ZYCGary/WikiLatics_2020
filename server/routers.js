const {app} = require('./express')
const {checkCookie} = require('@middlewares/authentication')

app.use(checkCookie)

const indexRouter = require('@routes/index_routes')
const analyticsRouter = require('@routes/analytics_routes')
app.use('/', indexRouter)
app.use('/analytics', analyticsRouter)

module.exports = app