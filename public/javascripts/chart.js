google.setOnLoadCallback(createChart);

var chart;

function createChart() {
  chart = new google.charts.Line(document.getElementById('curve_chart'));
  drawChart();
}

function drawChart() {
  $.getJSON('http://www.lrp-world.org/brewfridge/tempdata', function(data){
    var parsedData=[];
    data.forEach(function(d){
      parsedData.push([new Date(d[0]), d[1], d[2], d[3]]);

    });
    var data = google.visualization.arrayToDataTable(parsedData);

    var options = {
      backgroundColor: { 
        strokeWidth: 2
      }, 
      explorer: {actions: ['dragToZoom', 'rightClickToReset']}
    };

    chart.draw(data, google.charts.Line.convertOptions(options));
  });
  setTimeout(drawChart, 30000);
}

function update() {
  $.getJSON("/brewfridge/current", function(result) {
    $( "#beerTemp" ).html("Beer Temp<br/>" + result.beer + " &deg;C");
    $( "#fridgeTemp" ).html("Fridge Temp<br/>" + result.fridge + " &deg;C");
    $( "#lastReport" ).html("Fridge Temp<br/>" + result.lastReportTime + " S");
  });    
  setTimeout(update, 10000);
}

setTimeout(update, 10000);
