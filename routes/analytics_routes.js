const express = require('express');
const router = express.Router();

const { loggedIn } = require('@middlewares/authentication')

router.use(loggedIn);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Analytics page');
});

module.exports = router;
