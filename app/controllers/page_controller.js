const { APP_NAME } = require('@config/app')

const index = (req, res, next) => {
    let options = {
        title: APP_NAME,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    }
    if (req.user) {
        options.username = req.user.local.username
        options.email = req.user.local.email
    }
    res.render('index', options)
}

module.exports = {
    index
}
