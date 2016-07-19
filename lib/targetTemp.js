var Q = require('q');

function getTargetData(connection) {
  connection.query('SELECT timestampdiff(MINUTE,IFNULL(min(logtime), now()), now())/(60*24) AS t FROM templog', [], function(err, results) {
    cTime = results[0].t;
    connection.query('SELECT daysFromStart, temp FROM fermSteps WHERE daysFromStart > ? ORDER BY daysFromStart asc LIMIT 1', [cTime], function (err, results) {
      time1 = results[0].daysFromStart;
      temp1 = results[0].temp;
      connection.query('SELECT daysFromStart, temp FROM fermSteps WHERE daysFromStart <= ? ORDER BY daysFromStart DESC LIMIT 1', [cTime], function (err, results) {
        time2 = results[0].daysFromStart;
        temp2 = results[0].temp;
        m = (temp1-temp2)/(time1-time2);
        n = temp1 - (m*time1);
        target = (cTime*m)+n;
        tempData ={'temp':target, 'time': cTime};
      });
    });
  });
}


function getTargetDataPromise(connection) {
  cTimePromise = getCurrentTimeRelativeToStartPromise(connection);
  nextTempDataPromise = getNextTempPointAfterTimePromise(connection, cTimePromise);
  console.log("a");
  prevTempDataPromise =  getPrevTempPointBeforeTimePromise(connection, cTimePromise);
  console.log(prevTempDataPromise);

  currentTempDataPromise = getCurrentTempDataPromise(prevTempDataPromise, nextTempDataPromise, cTimePromise);
  return currentTempDataPromise;
}


function getCurrentTimeRelativeToStartPromise(connection) {
  var qqry = Q.ninvoke(connection, "query", 'SELECT timestampdiff(MINUTE, min(logtime), now())/(60*24) AS t FROM templog', []).then(function(data) {return data[0][0].t});
  return qqry;
}

function getNextTempPointAfterTimePromise(connection, time) {

  return time.then(function(time){
    return Q.ninvoke(connection, "query", 'SELECT daysFromStart, temp FROM fermSteps WHERE daysFromStart > ? ORDER BY fermStepId asc LIMIT 1', [time])
  });
}

function getPrevTempPointBeforeTimePromise(connection, time) {
   return time.then(function(time){
    return Q.ninvoke(connection, "query",'SELECT daysFromStart, temp FROM fermSteps WHERE daysFromStart < ? ORDER BY fermStepId DESC LIMIT 1', [time]);
  });
}

function getCurrentTempDataPromise(prev, next, time) {
  console.log("c");
  return Q.all([prev, next, time]).then(function(values) {
    console.log("d");
    prev = values[0][0][0];
    next = values[1][0][0];
    time = values[2];
    gradient = (next.temp - prev.temp)/(next.daysFromStart-prev.daysFromStart);
    constant = prev.temp - (prev.daysFromStart * gradient);
    console.log("grad "+gradient);
    console.log("const "+constant); 
    targetTemp = gradient * time + constant;
    return targetTemp;
  });
}

module.exports = {
  getTargetData:getTargetData,
  getTargetDataPromise:getTargetDataPromise
}
