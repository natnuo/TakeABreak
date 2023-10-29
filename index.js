const { ipcRenderer } = require("electron");
const $ = require("jquery");

const TIPS = [
  'Tip: Clicking your mouse down, then pressing "esc" skips this timer! Use it only if necessary...',
  "Tip: Settings only update once the timer is restarted",
  "Look outside—it's good for your eyes!",
  "Smile more :)",
  "Stay hydrated! You will be more productive.",
  "Listening to classical music can, for some people, increase productivity.",
  "Focus! 30 productive minutes is far better than hundreds of unproductive ones.",
];
let unusedTips = TIPS;

let WORK_TIME = null; // seconds
let BREAK_TIME = null;

let USE_OVERLAY = false;
let PLAY_SOUND_ON_END = false;

const timerForeground = $("#timer-bar > #foreground");
const mainContainer = $("#main");
const tipText = $("#tip");

let isTimerRunning = false;
$(document).on("keydown", (e) => {
  if (e.code === "Escape") {
    endTimer(true);
  }
});
const endTimer = (r) => {
  if (!isTimerRunning) return;

  isTimerRunning = false;
  // play sound
  if (PLAY_SOUND_ON_END && !r) {
    const audio = new Audio("./images/w.mp3");
    audio.volume = 0.1;
    audio.play();
  }
  // hide items
  setTimeout(
    () => {
      mainContainer.css("opacity", "0");
      setTimeout(() => {
        ipcRenderer.send("message", "hide", USE_OVERLAY);
        // reset
        timerForeground.css("width", "100%");

        // start next iteration
        setTimeout(startTimer, WORK_TIME * 1000);
      }, 3000);
    },
    r || !PLAY_SOUND_ON_END ? 0 : 2222
  );
};
ipcRenderer.on("show", (event, data) => {
  setTimeout(() => {
    mainContainer
      .css(
        "background-image",
        `url(./images/b${Math.floor(Math.random() * 17)}.png)`
      )
      .css("opacity", "100%");
    timerForeground
      .css("transition-property", "width")
      .css("transition-duration", `${BREAK_TIME}s`)
      .css("width", "0");
    setTimeout(() => {
      endTimer(false);
    }, BREAK_TIME * 1000);
  }, 1000);
});
ipcRenderer.on(
  "startTimer",
  (event, workTime, breakTime, useOverlay, playSoundOnEnd) => {
    WORK_TIME = workTime;
    BREAK_TIME = breakTime;
    USE_OVERLAY = useOverlay;
    PLAY_SOUND_ON_END = playSoundOnEnd;
    setTimeout(startTimer, WORK_TIME * 1000);
  }
);
const startTimer = () => {
  isTimerRunning = true;

  // set tip text
  if (unusedTips.length === 0) unusedTips = TIPS;
  const tipIx = Math.floor(Math.random() * unusedTips.length);
  tipText.html(unusedTips[tipIx]);
  unusedTips.splice(tipIx, 1);

  // show window, run timer on window show
  ipcRenderer.send("message", "show", USE_OVERLAY);
};
