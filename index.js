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
  "The unicorn is the national animal of Scotland.",
  "McDonalds sells spaghetti in the Philippines!",
  "The olympics used to have art competitions.",
  'The hashtag symbol, "#", is also known as an "octothorpe"',
  'The ampersand, "&", used to be the 27th letter of the alphabet!',
  "Ketchup used to be sold as medicine!",
  "You can't hum while pinching your nose. (try it!)",
  "KitKats are sold in more than 200 different flavors in Japan!",
  'Like fingerprints, we all have unique "tongue prints"!',
  'A "tittle" is the small dot in "i" and "j".',
  "Japan has approximately 1 vending machine for every 23 people.",
  '"Finger-fumblers" are tongue-twisters, but for sign language!',
  'You may have seen the Aurora Borealis in the arctic, but have you seen its southern equivalent, the "Aurora Australis"?',
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
    console.log("escaped");
    endTimer(true);
  }
});
const endTimer = (r) => {
  if (!isTimerRunning) return;

  isTimerRunning = false;
  // play sound
  if (PLAY_SOUND_ON_END && !r) {
    const audio = new Audio("./images/w.mp3");
    audio.volume = 0.8;
    audio.play();
  }
  // hide items
  setTimeout(
    () => {
      console.log("CLOSEIGNGG");
      mainContainer.css("opacity", "0");
      setTimeout(() => {
        ipcRenderer.send("hide", "");
        // reset
        timerForeground.css("width", "100%");
      }, 3000);
    },
    r || !PLAY_SOUND_ON_END ? 0 : 2222
  );
};
ipcRenderer.on(
  "startTimer",
  (event, workTime, breakTime, useOverlay, playSoundOnEnd) => {
    WORK_TIME = workTime;
    BREAK_TIME = breakTime;
    USE_OVERLAY = useOverlay;
    PLAY_SOUND_ON_END = playSoundOnEnd;
    startTimer();
  }
);
const startTimer = () => {
  isTimerRunning = true;
  console.log("starting timer");

  // set tip text
  // i realize that below code doesn't prevent replay-tips anymore. below code was coded before some major changes, and i'm not going to change it bc its functional don't want to break anything lol
  if (unusedTips.length === 0) unusedTips = TIPS;
  const tipIx = Math.floor(Math.random() * unusedTips.length);
  tipText.html(unusedTips[tipIx]);
  unusedTips.splice(tipIx, 1);

  setTimeout(() => {
    console.log("showing timer");
    mainContainer
      .css(
        "background-image",
        `url(./images/b${Math.floor(Math.random() * 11)}.png)`
      )
      .css("opacity", "100%");
    timerForeground
      .css("transition-property", "width")
      .css("transition-duration", `${BREAK_TIME}s`)
      .css("width", "0");
    setTimeout(() => {
      console.log("ending timer");
      endTimer(false);
    }, BREAK_TIME * 1000);
  }, 1000);
};
ipcRenderer.send("ready", "");
