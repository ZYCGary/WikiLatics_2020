const express = require('express');
const router = express.Router();
const { checkCookie, loggedIn } = require('../middlewares/authentication')

router.use(checkCookie);
router.use(loggedIn);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Analytics page');
});

module.exports = router;
