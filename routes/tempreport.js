var express = require('express');
var reportTemp = require('reportTemp');
var router = express.Router();


router.post('/', function(req, res, next) {
  console.log(req.ip);
  req.getConnection(function(err, connection) {
      if (err) return next(err);
      reportTemp.updateOrSetTemp(connection, req.body);
  });
  next();
});

router.post('/', function(req, res, next) {
  res.sendStatus(200);
});

module.exports = router;
