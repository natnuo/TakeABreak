const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

let win;
// add esc to exit, add fun text, other cool things!
// (also webpack!)
const createWindow = () => {
  win = new BrowserWindow({
    width: 1,
    height: 1,
    fullscreen: true,
    title: "Get Up!",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.webContents.openDevTools();
  win.setMenu(null);
  win.loadFile("index.html");
  win.hide();
};

ipcMain.on("message", (event, arg) => {
  if (arg === "hide") win.hide();
  else if (arg === "show") {
    win.show();
    event.reply("show", "");
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Implementing OS norms
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
