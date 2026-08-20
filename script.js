let hrs = document.getElementById("hrs");
let min = document.getElementById("min");
let sec = document.getElementById("sec");
setInterval(() => {

    let currTime = new Date();
    hrs.textContent = (currTime.getHours() < 10 ? "0" : "") + currTime.getHours();
    min.textContent = (currTime.getMinutes() < 10 ? "0" : "") + currTime.getMinutes();
    sec.textContent = (currTime.getSeconds() < 10 ? "0" : "") + currTime.getSeconds();
}, 1000)