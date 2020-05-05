const express = require('express')
const router = express.Router()

const { authenticated } = require('../app/middlewares/authentication')
const analyticsController = require('../app/controllers/analytics_controller')

router.use(authenticated)

router.get('/', analyticsController.index)
router.post('/import-data', analyticsController.importData)
router.post('/get-authors', analyticsController.getAuthorNames)
router.post('/overall-tops', analyticsController.getOverallTopArticles)

module.exports = router
