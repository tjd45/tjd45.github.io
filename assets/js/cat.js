var nextDate = new Date(1697191200000);

document.getElementById("countdown-date").innerHTML = nextDate.toLocaleString('en-gb', { dateStyle: "full", timeStyle: "long" });

var now = new Date().getTime();

// Find the distance between now and the count down date
var distance = nextDate - now;

// Time calculations for days, hours, minutes and seconds
var days = Math.floor(distance / (1000 * 60 * 60 * 24));
var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
var seconds = Math.floor((distance % (1000 * 60)) / 1000);

// Display the result in the element with id="demo"
document.getElementById("time-remaining").innerHTML = "Time Remaining: " + days + "d " + hours + "h "
    + minutes + "m " + seconds + "s ";

var x = setInterval(function () {

    // Get today's date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = nextDate - now;

    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element with id="demo"
    document.getElementById("time-remaining").innerHTML = "Time Remaining: " + days + "d " + hours + "h "
        + minutes + "m " + seconds + "s ";

    // If the count down is finished, write some text
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("time-remaining").innerHTML = "🎉 REUNITED 🎉";
    }
}, 1000);