/* eslint global-require: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import * as Auth from './auth';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow = null;
let original_position = {};

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({width: 1000, height: 600, frame:true});

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  setupIpcListeners();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
});

function setupIpcListeners(){
  ipcMain.on("get-auth-user", async () => {
    try {
      const user = await Auth.getUser();
      mainWindow.webContents.send("auth-user-found", user);
    } catch (error) {
      mainWindow.webContents.send("no-auth-user", error);
    }
  })

  ipcMain.on("authenticate", async () => {
    try {
      const user = await Auth.authenticate( mainWindow );
      mainWindow.webContents.send("auth-complete", user);
    } catch (error) {
      console.log("Auth failed", error);
      mainWindow.webContents.send("auth-failed", error);
    }
  })

  ipcMain.on("sign-out", async () => {
    try {
      await Auth.removeUser();
      mainWindow.webContents.send("signed-out");
    } catch (error) {
      mainWindow.webContents.send("sign-out-failed", error);
    }
  })

  ipcMain.on("float-it", () => {
    const floating = mainWindow.isAlwaysOnTop();
    const width = floating ? 1000 : 500;
    const height = floating ? 600 : parseInt(9 * 500 / 16) + 360;
    let left = 0, top = 0;

    if(!floating){
      original_position = mainWindow.getPosition();
    }else{
      left = original_position[0];
      top = original_position[1];
    }

    mainWindow.setPosition(left, top, true);

    mainWindow.setSize(width, height);
    mainWindow.setAlwaysOnTop(!floating);
    mainWindow.setResizable(floating);
  })

  ipcMain.on("fill-it", (event, state) => {
    mainWindow.setFullScreen(state);
  })
}
