$(document).ready(function () {
  
    $("#schedule").click(function () {
        location.href='/teacher';
    });
    $("#dept_classes").click(function () {
        location.href='/classes';
    });
    $("#scheduled_classes").click(function () {
        location.href='/scheduled_classes';
    });
    $("#hp_btn").click(function () {
        
        document.location.href='/';
    });
    $("#logout").click(function () {
        
        document.location.href='/logout';
    });
 });
