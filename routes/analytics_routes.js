const express = require('express')
const router = express.Router()

const {authenticated} = require('../app/middlewares/authentication')
const analyticsController = require('../app/controllers/analytics_controller')
const overallAnalyticsController = require('../app/controllers/overall_analytics_controller')
const articleAnalyticsController = require('../app/controllers/article_analytics_controller')
const authorAnalyticsController = require('../app/controllers/author_analytics_controller')

router.use(authenticated)

router.get('/', analyticsController.index)
router.post('/import-data', analyticsController.importData)

// Author analytics routers
router.post('/get-authors', authorAnalyticsController.getAuthorNames)
router.post('/analyse-by-author', authorAnalyticsController.analyseByAuthor)

// Overall analytics routers
router.post('/overall-tops', overallAnalyticsController.getOverallTopArticles)
router.post('/overall-charts-data', overallAnalyticsController.getOverallChartsData)

// Individual article analytics routers
router.post('/get-articles', articleAnalyticsController.getArticlesInfo)
router.post('/analyse-article', articleAnalyticsController.analyseArticle)

module.exports = router
