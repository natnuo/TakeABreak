const { ipcRenderer, webFrame } = require("electron");
const $ = require("jquery");
let workTime;
let breakTime;
let timerOn = false;
const setSubtitleTime = (date) => {
  $("#subtitle").html(
    `Next Break: ${date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    })}`
  );
};
$(".sm-option")
  .on("click", (e) => {
    $(e.target).toggleClass("selected");
  })
  .on("keydown", (e) => {
    if (e.which === 13) e.preventDefault();
  });
$("#timer-toggle").on("click", () => {
  workTime = parseFloat($("#work-time-input").val());
  breakTime = parseFloat($("#break-time-input").val());
  if (!timerOn) {
    if (!workTime || !breakTime) {
      $("#error").html("Work time and a break time should be numbers");
    } else if (workTime < 0.2) {
      $("#error").html("Work time must be at least 0.2 minutes");
    } else if (breakTime < 0.1) {
      $("#error").html("Break time must be at least 0.1 minutes");
    } else {
      $("#error").html("");
      ipcRenderer.send(
        "startSend",
        workTime * 60,
        breakTime * 60,
        $("#use-overlay-toggle").hasClass("selected"),
        $("#play-sound-on-end-toggle").hasClass("selected")
      );
      timerOn = true;
      $("#heading").html("End");
      // minus 1 to account for some window creation time things
      setSubtitleTime(new Date(new Date().getTime() + workTime * 60000));
    }
  } else {
    ipcRenderer.send("endSend", "");
    timerOn = false;
    $("#heading").html("Start");
    $("#subtitle").html("");
  }
});
ipcRenderer.on("hidingTimer", () => {
  setSubtitleTime(new Date(new Date().getTime() + workTime * 60000));
});
$("#main").css(
  "background-image",
  `url(./images/s${Math.floor(Math.random() * 3)}.png)`
);
$(document).on("keypress", (e) => {
  if (e.which === 13) {
    $("#timer-toggle").trigger("click");
  }
});
$("#zoom-out").on("click", () => {
  webFrame.setZoomFactor(Math.max(webFrame.getZoomFactor() - 0.2, 0.4));
});
$("#zoom-in").on("click", () => {
  webFrame.setZoomFactor(Math.min(webFrame.getZoomFactor() + 0.2, 2));
});
ipcRenderer.on("startTimeout", (event, timeMS, id) => {
  setTimeout(() => {
    ipcRenderer.send("recieveTimeout", id);
  }, timeMS);
});
