const { ipcRenderer } = require("electron");
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
$("#timer-toggle").on("click", () => {
  workTime = parseInt($("#work-time-input").val());
  breakTime = parseInt($("#break-time-input").val());
  if (!timerOn) {
    if (!workTime || !breakTime) {
      $("#error").html("Work time and a break time should be numbers");
    } else if (workTime < 10) {
      $("#error").html("Work time must be at least 10 seconds");
    } else if (breakTime < 5) {
      $("#error").html("Work time must be at least 5 seconds");
    } else {
      $("#error").html("");
      ipcRenderer.send("startSend", workTime, breakTime);
      timerOn = true;
      $("#heading").html("End");
      // minus 1 to account for some window creation time
      setSubtitleTime(new Date(new Date().getTime() + (workTime - 1) * 1000));
    }
  } else {
    ipcRenderer.send("endSend", "");
    timerOn = false;
    $("#heading").html("Start");
    $("#secondary").html("");
  }
});
ipcRenderer.on("hidingTimer", () => {
  setSubtitleTime(new Date(new Date().getTime() + workTime * 1000));
});
