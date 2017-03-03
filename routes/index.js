var express = require('express');
var router = express.Router();
var multer  = require('multer');
fs = require('fs');

var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var crypto = require('crypto');

passport.use(new Strategy({passReqToCallback: true},
  function(req, username, password, done) {
    hash = crypto.createHmac('sha512', "gr4asda").update(password).digest('hex');
    req.getConnection(function(err, connection) {
      if (err) return done(err);
      connection.query('SELECT id FROM users WHERE username=? AND password=?', [username, hash], function(err, results) {
        if (err) {return done(err);};
        if (results.length == 0) {
          return done(null, false);
        }
        user = {id: results[0].id};
        return done(null, user);
      });
    });
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    cb(null, id);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  req.getConnection(function(err, connection) {
      if (err) return next(err);

      connection.query('SELECT beer, fridge, TIMESTAMPDIFF(SECOND, eventtime, now()) as logtimediff FROM measurements ORDER BY eventtime DESC LIMIT 1', [], function(err, results) {
        if (err) return next(err);
        if (results.length == 0) {
          res.render('index', {title: 'Brew Fridge', beer: 'n/a', fridge: 'n/a', lastReportTime: 'n/a' });
        }
        else {
          res.render('index', {
            title: 'Brew Fridge',
            beer: results[0].beer,
            fridge: results[0].fridge,
            lastReportTime: results[0].logtimediff
          });
        }
      });
  });
});

/* Current temp and time data */

router.get('/current', function(req, res, next) {
  req.getConnection(function(err, connection) {
    if (err) return next(err);
     connection.query('SELECT beer, fridge, internal, gravity, TIMESTAMPDIFF(SECOND, eventtime, now()) as logtimediff FROM measurements ORDER BY eventtime DESC LIMIT 1', [], function(err, results) {
        if (err) return next(err);
       if (results.length == 0) {
         res.json({ beer: 'n/a', fridge: 'n/a', internal: 'n/a', gravity: 'n/a', lastReportTime: 'n/a' });
       }
       else {
         res.json({beer: results[0].beer, fridge: results[0].fridge, internal: results[0].internal, gravity: results[0].gravity, lastReportTime: results[0].logtimediff});
       }
           
    });
  });
});

router.get('/profile',
  require('connect-ensure-login').ensureLoggedIn('/brewfridge/login'),
  function(req, res, next) {
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
      connection.query('INSERT INTO fermSteps (daysFromStart, temp) values ?', [data], function(err, rows, fields) {res.redirect('/brewfridge');});
    });
  });
});

router.get('/update', function(req, res, next) {

  res.sendStatus(200);
});

router.get('/login',
  function(req, res){
    res.render('login');
  });

router.post('/login',
  passport.authenticate('local', { successRedirect: '/brewfridge/profile',
                                   failureRedirect: '/brewfridge/login',
                                   failureFlash: true })
);

module.exports = router;
