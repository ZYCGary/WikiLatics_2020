let express = require('express');
let router = express.Router();

let registerController = require('../controllers/auth/registerController'),
    loginController = require('../controllers/auth/loginController'),
    forgotPasswordController = require('../controllers/auth/forgotPasswordController')

/* GET landing page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Auth routers */
router.get('/register', registerController.index);
router.post('/register', registerController.register);
router.get('/login', loginController.index);
router.post('/login', loginController.login);
router.get('/forgot-password', forgotPasswordController.index);
router.post('/forgot-password', forgotPasswordController.sendsPasswordResetEmails);

module.exports = router;
