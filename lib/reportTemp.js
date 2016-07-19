function setTemp(connection, tempData) {
  connection.query('INSERT INTO templog (fridge, beer, internal, gravity) VALUES (?, ?, ?, ?)', [tempData['fridge'], tempData['beer'], tempData['internal'], tempData['gravity']], function(err, res) {
     if (err) return next(err);
  });
}

function updateTemp(connection, tempData) {
  connection.query('UPDATE templog SET temp=?, 6df9=?, 4bfe=?, logtime=NOW() ORDER BY logtime DESC LIMIT 1', [tempData.temp, tempData['6df9'], tempData['4bfe']], function(err, res) {
     if (err) console.log(err);
  });
}

function updateOrSetTemp(connection, tempData) {
  currentTemp = tempData.beer;
  console.log(tempData);
  connection.query('SELECT count(*) AS cnt FROM templog', [], function(err, results) {
    if (err) console.log(err);
    if (results[0].cnt>2) {
      connection.query('SELECT beer FROM templog ORDER BY logtime DESC LIMIT 2', [], function(err, results) {
        if (err) console.log(err);
        console.log(results[0].beer);
        console.log(currentTemp);
        if (results[0].beer == results[1].beer && results[0].beer == currentTemp) {
//          updateTemp(connection, tempData);
          setTemp(connection, tempData);
        }
        else {
          setTemp(connection, tempData);
        }

      });
    }
    else {
      setTemp(connection, tempData);
    }
  });

}

module.exports = {
  updateOrSetTemp:updateOrSetTemp
}
