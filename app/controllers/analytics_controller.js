const async = require('async')
const EditorService = require('@services/editor_service')

const index = async (req, res, next) => {
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
            .then(() => res.status(200).json({message: 'All data imported! You are ready to analytic data ~^-^~'}))
    } catch (err) {
        res.status(500).json({message: 'Failed to import data because of internal errors'})
    }
}

module.exports = {
    index,
    importData
}
