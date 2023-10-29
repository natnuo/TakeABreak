const {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  Notification,
} = require("electron");
const path = require("node:path");

let running = false;
let displays;
let primaryDisplay;
let primaryWindow;
let timer;
let windows = [];
let settings;
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
      icon: __dirname + "/loegoe.ico",
    });
    win.setMenu(null);
    if (display.id === primaryDisplay.id) {
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
    icon: __dirname + "/loegoe.ico",
  });
  // settings.webContents.openDevTools();
  settings.setMenu(null);
  settings.loadFile("settings.html");
  settings.on("closed", () => {
    if (process.platform !== "darwin") {
      try {
        running = false;
      } catch {}
      app.quit();
    }
  });
};

// // neatest code you will ever see
// let wt = null;
// let bt = null;
// let ps = null;

// ipcMain.on("message", (event, arg, useOverlay) => {
//   sh(arg, useOverlay);
// });
// const sh = (arg, useOverlay) => {
//   if (arg === "hide") {
//     while (timers.length > 0) clearTimeout(timers.pop());
//     if (useOverlay) {
//       destroyWindows();
//     } else {
//       new Notification({
//         title: "Take a Break",
//         body: "time to get back to work!",
//       }).show();
//     }
//     settings.webContents.send("hidingTimer", "");
//     loop(wt, bt, useOverlay, ps);
//   } else if (arg === "show") {
//     if (useOverlay) {
//       createWindows();
//     }
//     windows.forEach((win) => {
//       win.webContents.send("show", "");
//     });
//   }
// };
const destroyWindows = () => {
  while (windows.length > 0) {
    windows.pop().close();
  }
  primaryWindow = null;
};
// const loop = (workTime, breakTime, useOverlay, pson) => {
//   wt = workTime;
//   bt = breakTime;
//   ps = pson;
//   timers.push(
//     setTimeout(() => {
//       if (useOverlay) {
//         sh("show", useOverlay);
//         primaryWindow.webContents.send(
//           "startTimer",
//           workTime,
//           breakTime,
//           useOverlay,
//           pson
//         );
//       } else {
//         new Notification({
//           title: "Take a Break",
//           body: "your break time has started!",
//         }).show();
//         timers.push(
//           setTimeout(() => {
//             sh("hide", useOverlay);
//           }, breakTime)
//         );
//       }
//     }, workTime)
//   );
// };
// ipcMain.on("startSend", (event, workTime, breakTime, useOverlay, pson) => {
//   loop(workTime, breakTime, useOverlay, pson);
// });
// ipcMain.on("endSend", (event, arg) => {
//   while (timers.length > 0) clearTimeout(timers.pop());
// });

// was a workaround, won't change now
ipcMain.on("recieveTimeout", (event, id) => {
  console.log(running);
  if (running) {
    if (id === 0) {
      if (USE_OVERLAY) {
        createWindows();
      } else {
        new Notification({
          title: "Take a Break",
          body: "your break time has started!",
        }).show();
        settings.webContents.send("startTimeout", BREAK_TIME * 1000, 1);
      }
    } else if (id === 1) {
      hide();
    }
  }
});
const workTimeLoop = () => {
  running = true;
  settings.webContents.send("startTimeout", WORK_TIME * 1000, 0);
};

const hide = () => {
  if (USE_OVERLAY) {
    destroyWindows();
  } else {
    new Notification({
      title: "Take a Break",
      body: "time to get back to work!",
    }).show();
  }
  settings.webContents.send("hidingTimer", "");
  workTimeLoop();
};
ipcMain.on("hide", (event, args) => {
  hide();
});
ipcMain.on("ready", (event, args) => {
  event.reply("startTimer", WORK_TIME, BREAK_TIME, USE_OVERLAY, PSON);
});

let WORK_TIME;
let BREAK_TIME;
let USE_OVERLAY;
let PSON;
ipcMain.on("startSend", (event, workTime, breakTime, useOverlay, pson) => {
  WORK_TIME = workTime;
  BREAK_TIME = breakTime;
  USE_OVERLAY = useOverlay;
  PSON = pson;
  workTimeLoop();
});
ipcMain.on("endSend", (event, args) => {
  running = false;
});

app.whenReady().then(() => {
  displays = screen.getAllDisplays();
  primaryDisplay = screen.getPrimaryDisplay();

  app.setLoginItemSettings({ openAtLogin: true });

  createSettingsWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createSettingsWindow();
  });
});
