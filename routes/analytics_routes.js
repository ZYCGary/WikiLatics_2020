const express = require('express')
const router = express.Router()

const { authenticated } = require('@middlewares/authentication')
const analyticsController = require('@controllers/analytics_controller')

router.use(authenticated)

router.get('/', analyticsController.index)
router.post('/import-data', analyticsController.importData)
router.post('/get-author-names', analyticsController.getAuthorNames)

module.exports = router
