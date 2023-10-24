const { app, BrowserWindow, ipcMain, screen } = require("electron");
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
      title: "Take A Break!",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
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
    title: "Take A Break: Settings",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // settings.webContents.openDevTools();
  settings.setMenu(null);
  settings.loadFile("settings.html");
  settings.on("closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
};

ipcMain.on("message", (event, arg) => {
  if (arg === "hide") {
    windows.forEach((win) => {
      win.hide();
    });
    settings.webContents.send("hidingTimer", "");
  } else if (arg === "show") {
    windows.forEach((win) => {
      win.show();
    });
    event.reply("show", "");
  }
});
const destroyWindows = () => {
  windows.forEach((win) => {
    win.close();
  });
};
ipcMain.on("startSend", (event, workTime, breakTime) => {
  createWindows();
  setTimeout(() => {
    primaryWindow.webContents.send("startTimer", workTime, breakTime);
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
