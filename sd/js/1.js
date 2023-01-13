$(function main() {

   setInterval(function () {

       $.get("get-request-count",function (count) {

           $("#content").html(count);

       })

   },5000)

});
