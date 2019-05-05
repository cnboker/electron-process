const _ = require("lodash");
const { BrowserWindow, ipcMain } = require("electron");
const foregroundWindows = [];
const backgroundWindows = [];
const backgroundProcessHandler = {
  addWindow(browserWindow) {
    foregroundWindows.push(browserWindow);
  },
  sendToAllForegroundWindows,
  sendToIPCRenderer
};

function sendToIPCRenderer(eventName, payload) {
  _.forEach(backgroundWindows, backgroundWindow => {
    backgroundWindow.webContents.send.apply(backgroundWindow.webContents, [
      eventName,
      payload
    ]);
  });
}

function sendToAllForegroundWindows(eventName, payload) {
  _.forEach(foregroundWindows, foregroundWindow => {
    foregroundWindow.webContents.send.apply(foregroundWindow.webContents, [
      eventName,
      payload
    ]);
  });
}

const main = {
  createBackgroundProcess(url, debug) {
    const backgroundWindow = new BrowserWindow({
      show: debug,
      webPreferences: {
        nodeIntegration: true
      }
    });
    backgroundWindows.push(backgroundWindow);
    if (!debug) {
      backgroundWindow.hide();
    } else {
      backgroundWindow.webContents.openDevTools();
    }
    backgroundWindow.loadURL(url);

    ipcMain.on("BACKGROUND_START", (event, result) => {
      backgroundWindow.webContents.send.apply(backgroundWindow.webContents, [
        "BACKGROUND_START",
        result
      ]);
    });

    ipcMain.on("BACKGROUND_REPLY", (event, result) => {
      sendToAllForegroundWindows("BACKGROUND_REPLY", result);
    });

    ipcMain.on("CALLBACK", (event, payload) => {
      sendToAllForegroundWindows("CALLBACK", payload);
    });
    return backgroundProcessHandler;
  }
};

module.exports = main;
