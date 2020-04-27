const { APP_NAME } = require('@config/app')

const index = (req, res, next) => {
    res.render('index', {
        title: APP_NAME + ' - Home',
        username: req.session.username,
        email: req.session.email,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    })
}

module.exports = {
    index
}
