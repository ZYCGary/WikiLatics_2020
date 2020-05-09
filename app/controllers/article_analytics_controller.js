const ArticleAnalyticsService = require('../services/article_analytics_service')

const getArticlesInfo = async (req, res) => {
    try {
        const articlesInfo = await ArticleAnalyticsService.findArticlesWithTitleAndRevisionCount()
        res.status(200).json({
            articlesInfo: articlesInfo,
        })
    } catch (err) {
        res.status(500).json({message: 'Failed to get analytics results because of server internal errors'})
    }
}

const analyseArticle = async (req, res) => {
    try {
        const article = req.body.article
        const latestTimestamp = await ArticleAnalyticsService.findLatestTimestamp(article)
        const timeDiff = (new Date() - latestTimestamp) / (1000 * 3600 * 24)

        // Update article revisions if it is out of date.
        if (timeDiff > 1) {
            // Update revisions via MediaWiki API.
            const newRevisionCount = await ArticleAnalyticsService.updateRevisions(article, latestTimestamp.toISOString())
            req.flash('success', `${newRevisionCount} new revisions downloaded.`)
        } else {
            req.flash('success', 'Your data is up to data, no new revision downloaded.')
        }
        // TODO: search & construct results
        const [revisionCount, topRegularUsers, topNews] = await Promise.all([
            ArticleAnalyticsService.getRevisionCountByArticle(article),
            ArticleAnalyticsService.getTopRegularUsersByArticle(article),
            ArticleAnalyticsService.getTopNewsByArticle(article)
        ])
        console.log(revisionCount, topRegularUsers, topNews)
        const analyseResults = {
            title: article,
            revisionCount: revisionCount,
            topRegularUsers: topRegularUsers,
            topNews: topNews
        }
        res.status(200).json(analyseResults)
    } catch (err) {
        res.status(500).json({message: 'Failed to get author analytics results because of server internal errors'})
    }
}

module.exports = {
    getArticlesInfo,
    analyseArticle
}
