'use strict'

import { app, protocol, BrowserWindow, screen, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const { ipcMain } = require('electron')
const isDevelopment = process.env.NODE_ENV !== 'production'
let mainWindow = null
let projectionWindow = null
let hideAllCSSKey = null
let muted = false
let currentSubtitle = null
let currentLowerThird = null

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

ipcMain.on("showProjection", (event, arg) => {
  showProjection(arg)
})

ipcMain.handle("mute", () => {
  return toggleHideAll()
})

async function toggleHideAll() {
  if (projectionWindow) {
    if (hideAllCSSKey) {
      projectionWindow.webContents.removeInsertedCSS(hideAllCSSKey)
      hideAllCSSKey = null
      muted = false
    } else {
      hideAllCSSKey = await projectionWindow.webContents.insertCSS("body {display: none}")
      muted = true
    }
  } else {
    muted = !muted;
  }
  mainWindow.webContents.send("muteStatus", muted);
}

async function showProjection(settings) {
  if (projectionWindow === null) {
    projectionWindow = new BrowserWindow({
      fullscreenable: true, backgroundColor: settings.backgroundColor, show: false, webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
    })
    projectionWindow.on("closed", () => {
      projectionWindow = null
      hideAllCSSKey = null
    })
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      projectionWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + 'projection.html')
    } else {
      projectionWindow.loadURL('app://./projection.html')
    }
    projectionWindow.on("ready-to-show", () => {
      for (const display of screen.getAllDisplays()) {
        if (display.size.width === 1920 && display.size.height === 1080) {
          if (display.id != screen.getPrimaryDisplay().id) {
            console.log(display);
            projectionWindow.setPosition(display.workArea.x, display.workArea.y);
            projectionWindow.setFullScreen(true);
            break;
          }
        }
      }
      // restore states
      projectionWindow.webContents.send("updateSettings", settings);
      if (muted && !hideAllCSSKey) {
        toggleHideAll()
      }
      showSubtitle(currentSubtitle)
      showLowerThird(currentLowerThird)

      projectionWindow.show()
    })
  } else {
    projectionWindow.show()
  }
}

ipcMain.on("showSubtitle", (event, arg) => {
  showSubtitle(arg)
})

async function showSubtitle(item) {
  if (projectionWindow) {
    projectionWindow.webContents.send("showSubtitle", item)
  }
  currentSubtitle = item
}

ipcMain.on("showLowerThird", (event, arg) => {
  showLowerThird(arg)
})

async function showLowerThird(item) {
  if (projectionWindow) {
    projectionWindow.webContents.send("showLowerThird", item)
  }
  currentLowerThird = item
}

ipcMain.on("updateSettings", (event, arg) => {
  if (projectionWindow) {
    console.log(arg)
    projectionWindow.setBackgroundColor(arg.backgroundColor)
    projectionWindow.webContents.send("updateSettings", arg)
  }
})

ipcMain.on("nextSubtitle", () => {
  // from projection.html to vue
  if (mainWindow) {
    mainWindow.webContents.send("nextSubtitle")
  }
})

async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    backgroundColor: '#1e222d',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    //if (!process.env.IS_TEST) mainWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  globalShortcut.unregisterAll();
  globalShortcut.register('CommandOrControl+Right', () => {
    mainWindow.webContents.send("nextSubtitle")
  })
  globalShortcut.register('CommandOrControl+Left', () => {
    mainWindow.webContents.send("previousSubtitle")
  })
  globalShortcut.register('CommandOrControl+0', () => {
    toggleHideAll()
  })
  globalShortcut.register('CommandOrControl+O', () => {
    mainWindow.webContents.send("showProjection")
  })
  globalShortcut.register('CommandOrControl+2', () => {
    mainWindow.webContents.send("clearSubtitle")
  })
  globalShortcut.register('CommandOrControl+1', () => {
    mainWindow.webContents.send("clearLowerThird")
  })

  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
