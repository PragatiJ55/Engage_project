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
        console.log('meow');
        document.location.href='/';
    });
 });
