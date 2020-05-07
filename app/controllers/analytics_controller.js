const EditorService = require('../services/editor_service')
const RevisionService = require('../services/revision_service')

const index = (req, res) => {
    let options = {
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    }
    if (req.user) {
        options.username = req.user.local.username
        options.email = req.user.local.email
    }
    res.render('analytics', options)
}

/*
* Import analytics data from local files to database.
* Data import is a required before data analytics.
*/
const importData = async (req, res) => {
    try {
        await Promise.all([
            EditorService.importEditors('bots'),
            EditorService.importEditors('admin'),
            EditorService.importRevisions()
        ])
        res.status(200).json({message: 'All data imported! You are ready to analytic data ~^-^~'})
    } catch (err) {
        res.status(500).json({message: 'Failed to import data because of internal errors'})
    }

}

const getAuthorNames = async (req, res) => {
    try {
        const authorNames = await RevisionService.findAllAuthorNames()
        res.status(200).json({names: authorNames})
    } catch (err) {
        res.status(500).json(err)
    }
}

const analyseByAuthor = async (req, res) => {
    try {
        const user = req.body.author
        const results = await RevisionService.findRevisionsByUser(user)
        res.status(200).json(results)
    } catch (err) {
        res.status(500).json(err)
    }
}

const getOverallTopArticles = async (req, res) => {
    const filter = req.body.filter
    try {
        const [topRevisions, topUsers, topHistories] = await Promise.all([
            RevisionService.findTopArticlesByRevisionCount(filter),
            RevisionService.findTopArticlesByRegisteredUserCount(filter),
            RevisionService.findTopArticlesByHistory(filter)
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

const getArticlesInfo = async (req, res) => {
    try {
        const articlesInfo = await RevisionService.findArticlesWithTitleAndRevisionCount()
        res.status(200).json({
            articlesInfo: articlesInfo,
        })
    } catch (err) {
        res.status(500).json({message: 'Failed to get analytics results because of server internal errors'})
    }
}

const analyseArticle = async (req, res) => {
    const article = req.body.article
    const latestTimestamp = await RevisionService.findLatestTimestamp(article)
    const timeDiff = (new Date() - latestTimestamp) / (1000 * 3600 * 24)

    // Update article revisions if it is out of date.
    if (timeDiff > 1) {
        // TODO: update revisions via MediaWiki API.
        const newRevisionCount = await RevisionService.updateRevisions(article, latestTimestamp.toISOString())
        req.flash('success', `${newRevisionCount} new revisions downloaded.`)
    } else {
        req.flash('success', 'Your data is up to data, no new revision downloaded.')
    }
    // TODO: search & construct results

    console.log(timeDiff)
}

module.exports = {
    index,
    importData,
    getAuthorNames,
    analyseByAuthor,
    getOverallTopArticles,
    getArticlesInfo,
    analyseArticle
}
