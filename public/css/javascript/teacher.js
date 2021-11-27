$(document).ready(function() {
    var NowMoment = moment();
    
var min=NowMoment.format("YYYY-MM-DDTHH:mm:00");
    $("#dtl").attr({
               // substitute your own
       "min" : min          // values (or variables) here
    });
    
});