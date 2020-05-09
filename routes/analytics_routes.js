const express = require('express')
const router = express.Router()

const {authenticated} = require('../app/middlewares/authentication')
const analyticsController = require('../app/controllers/analytics_controller')

router.use(authenticated)

router.get('/', analyticsController.index)
router.post('/import-data', analyticsController.importData)

// Author analytics routers
router.post('/get-authors', analyticsController.getAuthorNames)
router.post('/analyse-by-author', analyticsController.analyseByAuthor)

// Overall analytics routers
router.post('/overall-tops', analyticsController.getOverallTopArticles)
router.post('/overall-charts-data', analyticsController.getOverallChartsData)

// Individual article analytics routers
router.post('/get-articles', analyticsController.getArticlesInfo)
router.post('/analyse-article', analyticsController.analyseArticle)

module.exports = router
