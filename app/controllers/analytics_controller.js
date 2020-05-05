const EditorService = require('../services/editor_service')
const RevisionService = require('../services/revision_service')

const index = (req, res, next) => {
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
const importData = async (req, res, next) => {
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

const getAuthorNames = async (req, res, next) => {
    try {
        const authorNames = await RevisionService.findAllAuthorNames()
        res.status(200).json({names: authorNames})
    } catch (err) {
        res.status(500).json(err)
    }
}

module.exports = {
    index,
    importData,
    getAuthorNames
}
