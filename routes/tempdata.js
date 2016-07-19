require('rootpath')();
var express = require('express');
var router = express.Router();
var targetTemp = require('lib/targetTemp');


router.get('/', function(req, res, next) {
  req.getConnection(function(err, connection) {
      if (err) return next(err);
      connection.query('select logtime as time, round(avg(fridge), 2) as fridge, round(avg(beer), 2) as beer, round(avg(internal), 2) as internal, round(avg(gravity), 3) as gravity,  ceil(id/15) as group_id from templog group by group_id', [], function(err, results) {
        outputData = [['Time', 'Fridge', 'Beer', 'Internal', 'Target Temperature', 'Gravity']];
        console.log(results);
        results.forEach(function(r) {
          outputData.push([r.time, r['fridge'], r['beer'], r['internal'], null, r['gravity']]);
        });
        connection.query('select (SELECT min(logtime) FROM templog) + INTERVAL daysFromStart DAY AS stepTime, temp FROM fermSteps', [], function(err, results) {
          results.forEach(function(r) {
            outputData.push([r.stepTime, null, null, null, r.temp, null]);
          });
          res.json(outputData);
        });
      });
  });
});

router.get('/gravity', function(req, res, next) {
  req.getConnection(function(err, connection) {
    if (err) return next(err);
    connection.query('select logtime as time, round(avg(gravity), 3) as gravity, ceil(id/15) as group_id from templog group by group_id', [], function(err, results) {
      outputData = [['Time', 'Gravity']];
      console.log(results);
      results.forEach(function(r) {
        outputData.push([r.time, r['gravity']]);
      });
      res.json(outputData);
    });
  });
});

router.get('/target', function(req, res, next) {
  req.getConnection(function(err, connection) {
    if (err) return next(err);
    targetData = targetTemp.getTargetDataPromise(connection);
    console.log('GotTargetPromise', targetData);
    targetData.then(function(data) {
      console.log('targetdata ', data);
      res.json(data);
    },
    function(err) {
      console.log(err);
    });
  });
});

router.get('/lastReportTime', function(req, res, next) {
  req.getConnection(function(err, connection) {
    if (err) return next(err);
    connection.query('select TIMESTAMPDIFF(SECOND, logtime, now()) as time, logtime from templog order by logtime desc limit 1', [], function(err, results) {
      res.send(results[0].time);
    });

  });
});


module.exports = router;
