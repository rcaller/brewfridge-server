google.setOnLoadCallback(createChart);

var pointCounter=0;
var chart;
var headers = [];

function createChart() {
  chart = new google.charts.Line(document.getElementById('curve_chart'));
  getData();
  $("#newrow").click(function() {
    var time = $("#temptable tr:last-child .time").val();
    var temp = $("#temptable tr:last-child .temp").val();
    createDataForm(time,temp);
    $("input, select").change(function(){
      drawChart();
    });
  });
}

function getData() {
  $.getJSON('http://www.lrp-world.org/brewfridge/tempdata/profile', function(currentData){
    var readHeaders = 0;
    currentData.forEach(function(d){
      if (readHeaders) {
        createDataForm(d[0], d[1]);
      }
      else {
        headers = [d[0], d[1]];
        readHeaders=1;
      }
    });
    $("input, select").change(function(){
      drawChart();
    });
    drawChart();
  });
}

function drawChart() {
  var parsedData = parseFormData();
  parsedData.unshift(headers);
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
      }
    },
    series: {
      0: {axis: 'temp'},
    }
  };

  function selectHandler(e) {
    var selectedItem = chart.getSelection()[0];
    if (selectedItem) {
      var day = data.getValue(selectedItem.row, 0);
      var temp = data.getValue(selectedItem.row, 1);
      console.log('Day ' + day);
      console.log('Temp ' + temp);
    }
  }
  google.visualization.events.addListener(chart, 'select', selectHandler);
  chart.draw(data, google.charts.Line.convertOptions(options));
};

function createDataForm(day, temp) {
  var rowName = "point"+pointCounter;
  pointCounter++;
  var dayInput = document.createElement('input');
  dayInput.setAttribute('type', 'text');
  dayInput.setAttribute('name', 'time');
  dayInput.setAttribute('class', 'time');
  dayInput.setAttribute('value', day);
  dayData = document.createElement('td');
  dayData.appendChild(dayInput);
  var tempInput = document.createElement('input');
  tempInput.setAttribute('type', 'text');
  tempInput.setAttribute('name', 'starttemp');
  tempInput.setAttribute('class', 'temp');
  tempInput.setAttribute('value', temp);
  tempData = document.createElement('td');
  tempData.appendChild(tempInput);
  removeTd = document.createElement('td');
  removeTd.setAttribute('id', 'remove'+rowName);
  removeTd.appendChild(document.createTextNode("-"));
  row = document.createElement('tr');
  row.setAttribute('id', rowName);
  row.appendChild(dayData);
  row.appendChild(tempData);
  row.appendChild(removeTd);
  table = document.getElementById('temptable');
  table.appendChild(row);
  $('#remove'+rowName).click(function() {$('#'+rowName).remove(); drawChart();});
}

function parseFormData() {
  var formData = $('#profileForm').serializeArray();
  var parsedFormData = [];
  var dataLength = formData.length/2
  for (var i =0; i<dataLength; i++) {
    day = formData.shift().value;
    temp = formData.shift().value;
    parsedFormData.push([parseInt(day), parseInt(temp)]);
  }
  return parsedFormData;
}


