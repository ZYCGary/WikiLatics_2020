const express = require('express');
const router = express.Router();

const { authenticated } = require('@middlewares/authentication')

router.use(authenticated);

router.get('/', function(req, res, next) {
  res.send('Analytics page');
});

module.exports = router;
