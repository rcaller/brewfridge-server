$( "#newrow" ).click(function() {
  $( "#temptable" ).append($( "#temptable tr:last-child" ).clone());
});
