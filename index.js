const { ipcRenderer } = require("electron");
const $ = require("jquery");

const WORK_TIME = 10;
const BREAK_TIME = 10;

const timer = $("#timer");
const tickTimer = (currTime) => {
  timer.html(`${currTime}s`);

  if (currTime === 0) {
    timer.css("opacity", "0");
    setTimeout(() => {
      ipcRenderer.send("message", "hide");
    }, 3000);
  } else {
    // don't ask why this is coded with setTimeout() recursion instead of setInterval()
    setTimeout(() => {
      tickTimer(currTime - 1);
    }, 1000);
  }
};
ipcRenderer.on("show", (event, data) => {
  setTimeout(() => {
    tickTimer(BREAK_TIME);
    timer.css("opacity", "100%");
  }, 1000);
});
const startTimer = () => {
  ipcRenderer.send("message", "show");
  setTimeout(startTimer, (WORK_TIME + BREAK_TIME) * 1000);
};
setTimeout(startTimer, BREAK_TIME);
