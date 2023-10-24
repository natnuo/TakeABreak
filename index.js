const { ipcRenderer } = require("electron");
const EventEmitter = require("events");
const $ = require("jquery");

const TIPS = [
  'Tip: Pressing "esc" skips this timer! Use it only if necessary...',
  "Look outside—it's good for your eyes!",
  "Smile more :)",
  "Stay hydrated! You will be more productive.",
  "Listening to classical music can, for some people, increase productivity.",
  "Focus! 30 productive minutes is far better than hundreds of unproductive ones.",
];
let unusedTips = TIPS;

let WORK_TIME = null; // seconds
let BREAK_TIME = null;

const timerForeground = $("#timer-bar > #foreground");
const mainContainer = $("#main");
const tipText = $("#tip");

let isTimerRunning = false;
$(document).on("keydown", (e) => {
  if (e.key === "Escape") {
    endTimer();
  }
});
const endTimer = () => {
  isTimerRunning = false;
  // hide items
  mainContainer.css("opacity", "0");
  setTimeout(() => {
    ipcRenderer.send("message", "hide");
    // reset
    timerForeground.css("width", "100%");

    // start next iteration
    setTimeout(startTimer, WORK_TIME * 1000);
  }, 3000);
};
ipcRenderer.on("show", (event, data) => {
  setTimeout(() => {
    mainContainer.css("opacity", "100%");
    timerForeground.css("transition", `width ${BREAK_TIME}s`).css("width", "0");
    setTimeout(() => {
      // WORK_TIME should be long enough so that timings won't get bugged
      // bugging timings involves certain specific actions (which I will not mention) done repeatedly
      // bugging timings will be a large time commitment, even if WORK_TIME is too short
      // bugging timings is not worth your time, and if you bug the timings successfully,
      // then congratulations!
      if (isTimerRunning) endTimer();
    }, BREAK_TIME * 1000);
  }, 1000);
});
ipcRenderer.on("startTimer", (event, workTime, breakTime) => {
  WORK_TIME = workTime;
  BREAK_TIME = breakTime;
  setTimeout(startTimer, BREAK_TIME * 1000);
});
const startTimer = () => {
  isTimerRunning = true;

  // set tip text
  if (unusedTips.length === 0) unusedTips = TIPS;
  const tipIx = Math.floor(Math.random() * unusedTips.length);
  tipText.html(unusedTips[tipIx]);
  unusedTips.splice(tipIx, 1);

  // show window, run timer on window show
  ipcRenderer.send("message", "show");
};
