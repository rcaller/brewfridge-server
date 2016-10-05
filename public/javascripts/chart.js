google.setOnLoadCallback(createChart);

var chart;
var gravityChart;

function createChart() {
  chart = new google.charts.Line(document.getElementById('curve_chart'));
//  gravityChart = new google.charts.Line(document.getElementById('gravity_chart'));
  drawChart();
}

function drawChart() {
  $.getJSON('http://www.lrp-world.org/brewfridge/tempdata', function(data){
    var parsedData=[];
    data.forEach(function(d){
      parsedData.push([new Date(d[0]), d[1], d[2], d[3], d[4], d[5]]);

    });
    console.log(parsedData);
    var data = google.visualization.arrayToDataTable(parsedData);

    var options = {
      legend: {position: 'none'},
      backgroundColor: { 
        strokeWidth: 2
      },
      vAxis: {format: 'decimal'}, 
      axes: {
        y: {
          temp: {label: 'Temp (Celsius)'},
          grav: {label: 'Gravity', range: {min: 1}}
        }
      },
      series: {
        0: {axis: 'temp'},
        1: {axis: 'temp'},
        2: {axis: 'temp'},
        3: {axis: 'temp'},
        4: {axis: 'grav'}
      }
    };

    chart.draw(data, google.charts.Line.convertOptions(options));
  });
  setTimeout(drawChart, 30000);
}

function drawGravityChart() {
  $.getJSON('http://www.lrp-world.org/brewfridge/tempdata/gravity', function(data){
    var parsedData=[];
    data.forEach(function(d){
      parsedData.push([new Date(d[0]), d[1]]);

    });
    var data = google.visualization.arrayToDataTable(parsedData);

    var options = {
      backgroundColor: {
        strokeWidth: 2
      },
       chartArea: {width: '80%'},
      vAxis: {format: 'decimal'},
      explorer: {actions: ['dragToZoom', 'rightClickToReset']}
    };

    gravityChart.draw(data, google.charts.Line.convertOptions(options));
  });
  setTimeout(drawGravityChart, 30000);
}

function update() {
  $.getJSON("/brewfridge/current", function(result) {
    $( "#beerTemp" ).html("Beer Temp<br/>" + result.beer + " &deg;C");
    $( "#fridgeTemp" ).html("Fridge Temp<br/>" + result.fridge + " &deg;C");
    $( "#internalTemp" ).html("Internal Temp<br/>" + result.internal + " &deg;C");
    $( "#gravity" ).html("Gravity<br/>" + result.gravity);
    $( "#lastReport" ).html("Last Report<br/>" + result.lastReportTime + " S");
  });    
  setTimeout(update, 10000);
}

setTimeout(update, 10000);
