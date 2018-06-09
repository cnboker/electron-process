const _ = require('lodash');
const {BrowserWindow, ipcMain} = require('electron');
const foregroundWindows = [];
const backgroundProcessHandler = {
  addWindow(browserWindow) {
    foregroundWindows.push(browserWindow);
  }
};

function sendToAllForegroundWindows(eventName, payload) {
  _.forEach(foregroundWindows, (foregroundWindow) => {
    foregroundWindow.webContents.send.apply(foregroundWindow.webContents, [eventName, payload]);
  });
}

const main = {
  createBackgroundProcess(url, debug) {
   const backgroundWindow = new BrowserWindow({show: debug});
    if (!debug) {
      backgroundWindow.hide();
    }else{
      backgroundWindow.webContents.openDevTools();
    }
    backgroundWindow.loadURL(url);

    ipcMain.on('BACKGROUND_START', (event, result) => {
      backgroundWindow.webContents.send.apply(backgroundWindow.webContents, ['BACKGROUND_START', result]);
    });

    ipcMain.on('BACKGROUND_REPLY', (event, result) => {
      sendToAllForegroundWindows('BACKGROUND_REPLY', result);
    });

    ipcMain.on('CALLBACK', (event, payload) => {
      sendToAllForegroundWindows('CALLBACK', payload);
    });
    return backgroundProcessHandler;
  }
};

module.exports = main;
