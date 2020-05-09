const EditorService = require('../services/editor_service')
const OverallAnalyticsService = require('../services/overall_analytics_service')

const getOverallTopArticles = async (req, res) => {
    const filter = req.body.filter
    try {
        const [topRevisions, topUsers, topHistories] = await Promise.all([
            OverallAnalyticsService.findTopArticlesByRevisionCount(filter),
            OverallAnalyticsService.findTopArticlesByRegisteredUserCount(filter),
            OverallAnalyticsService.findTopArticlesByHistory(filter)
        ])
        res.status(200).json({
            topRevisions: topRevisions,
            topUsers: topUsers,
            topHistories: topHistories
        })
    } catch (err) {
        res.status(500).json({message: 'Failed to get analytics results because of server internal errors'})
    }
}

const getOverallChartsData = async (req, res) => {
    try {
        const [pieChartData] = await Promise.all([
            OverallAnalyticsService.getRevisionDistributionDataForPieChart()
        ])
        console.log(pieChartData)
        res.status(200).json({
            pie: pieChartData
        })
    } catch (err) {
        res.status(500).json({message: 'Failed to get author analytics results because of server internal errors'})
    }
}

module.exports = {
    getOverallTopArticles,
    getOverallChartsData
}
