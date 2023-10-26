const {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  Notification,
} = require("electron");
const path = require("node:path");

let displays;
let primaryDisplay;

let primaryWindow;
let windows = [];
let settings;
// add esc to exit, add fun text, other cool things!
// also make sound when disappear
// hide cursor would be cool too
// (also webpack!)
const createWindows = () => {
  displays.forEach((display) => {
    const win = new BrowserWindow({
      width: 1,
      height: 1,
      x: display.bounds.x,
      y: display.bounds.y,
      fullscreen: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      icon: __dirname + "/images/loegoe.png",
    });
    win.hide();
    win.setMenu(null);
    if (display.id === primaryDisplay.id) {
      primaryWindow = win;
      win.loadFile("primary.html");
    } else {
      win.loadFile("secondary.html");
    }
    // win.webContents.openDevTools();
    win.setAlwaysOnTop(true, "screen-saver");
    win.setVisibleOnAllWorkspaces(true);
    windows.push(win);
  });
};
const createSettingsWindow = () => {
  settings = new BrowserWindow({
    width: primaryDisplay.bounds.width / 2,
    height: primaryDisplay.bounds.height / 2,
    x: primaryDisplay.bounds.x + 50,
    y: primaryDisplay.bounds.y + 50,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: __dirname + "/images/loegoe.png",
  });
  // settings.webContents.openDevTools();
  settings.setMenu(null);
  settings.loadFile("settings.html");
  settings.on("closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
};

ipcMain.on("message", (event, arg, useOverlay) => {
  if (arg === "hide") {
    if (useOverlay) {
      windows.forEach((win) => {
        win.hide();
      });
    } else {
      new Notification({
        title: "Take a Break",
        body: "time to get back to work!",
      }).show();
    }
    settings.webContents.send("hidingTimer", "");
  } else if (arg === "show") {
    if (useOverlay) {
      windows.forEach((win) => {
        win.show();
      });
    } else {
      new Notification({
        title: "Take a Break",
        body: "your break time has started!",
      }).show();
    }
    event.reply("show", "");
  }
});
const destroyWindows = () => {
  while (windows.length > 0) {
    windows.pop().close();
  }
  primaryWindow = null;
};
ipcMain.on("startSend", (event, workTime, breakTime, useOverlay, pson) => {
  createWindows();
  setTimeout(() => {
    if (primaryWindow)
      primaryWindow.webContents.send(
        "startTimer",
        workTime,
        breakTime,
        useOverlay,
        pson
      );
  }, 1000);
});
ipcMain.on("endSend", (event, arg) => {
  destroyWindows();
});

app.whenReady().then(() => {
  displays = screen.getAllDisplays();
  primaryDisplay = screen.getPrimaryDisplay();

  createSettingsWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createSettingsWindow();
  });
});
