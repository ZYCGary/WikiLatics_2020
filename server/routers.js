module.exports = (app) => {
    const indexRouter = require('../routes/index_routes')
    const analyticsRouter = require('../routes/analytics_routes')
    app.use('/', indexRouter)
    app.use('/analytics', analyticsRouter)
}
