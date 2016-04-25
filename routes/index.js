var express = require('express');
var router = express.Router();
var multer  = require('multer');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;
fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  req.getConnection(function(err, connection) {
      if (err) return next(err);

      connection.query('SELECT beer, fridge, TIMESTAMPDIFF(SECOND, logtime, now()) as logtimediff FROM templog ORDER BY logtime DESC LIMIT 1', [], function(err, results) {
        if (err) return next(err);
        res.render('index', {title: 'Brew Fridge', beer: results[0].beer, fridge: results[0].fridge, lastReportTime: results[0].logtimediff });
      });
  });
});

/* Current temp and time data */

router.get('/current', function(req, res, next) {
  req.getConnection(function(err, connection) {
    if (err) return next(err);
     connection.query('SELECT beer, fridge, TIMESTAMPDIFF(SECOND, logtime, now()) as logtimediff FROM templog ORDER BY logtime DESC LIMIT 1', [], function(err, results) {
        if (err) return next(err);
        res.json({ beer: results[0].beer, fridge: results[0].fridge, lastReportTime: results[0].logtimediff });
    });
  });
});

router.get('/profile', function(req, res, next) {
  res.render('profile', {});
});

router.get('/update', function(req, res, next) {
  req.getConnection(function(err, connection) {
    if (err) return next(err);
    data=[];
    for (i = 0; i < req.query.time.length; i += 1) {
      data.push([req.query.time[i], req.query.starttemp[i]]);
    }
    console.log(data);
    connection.query('DELETE from fermSteps', [], function(err, rows, fields) {
      if (err) return next(err);
      connection.query('INSERT INTO fermSteps (daysFromStart, temp) values ?', [data], function(err, rows, fields) {});
    });
  });
  console.log(req.query.time);
  console.log(req.query.starttemp);  
  next();
});

router.get('/update', function(req, res, next) {

  res.sendStatus(200);
});



module.exports = router;
