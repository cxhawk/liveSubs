'use strict'

import { app, protocol, BrowserWindow, screen, globalShortcut, dialog, shell } from 'electron'
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
let currentImage = null
let isProjectionFullscreen = false

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

// Auto updater
require('update-electron-app')({
  repo: 'cxhawk/liveSubs',
  updateInterval: '1 hour'
})

ipcMain.on("showProjection", (event, arg) => {
  showProjection(arg)
})

ipcMain.on("closeProjection", () => {
  closeProjection()
})

ipcMain.on("projectAtMax", (event, arg) => {
  projectAtMax(arg)
})

ipcMain.on("toggleProjectionFullscreen", (event, arg) => {
  toggleProjectionFullscreen(arg)
})

ipcMain.on("openExternal", (event, url) => {
  shell.openExternal(url)
})

ipcMain.handle("mute", () => {
  return toggleHideAll()
})

ipcMain.handle("openImage", () => {
  return dialog.showOpenDialogSync({
    title: "Open background image file",
    filters: [
      { name: 'Images', extensions: ['jpg', 'png'] }
    ]
  });
})

ipcMain.handle("openImages", () => {
  return dialog.showOpenDialogSync({
    title: "Open image files",
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'webm', 'mp4'] }
    ],
    buttonLabel: "Load",
    properties: [
      "multiSelections", "openFile"
    ]
  });
})

ipcMain.handle("selectSubtitleFolder", () => {
  return dialog.showOpenDialog({
    title: "Select folder to save subtitle files",
    buttonLabel: "Select Folder",
    properties: ["openDirectory", "createDirectory"]
  });
})

ipcMain.handle("saveSubtitleFile", async (event, { filePath, content }) => {
  const fs = require('fs').promises;
  try {
    await fs.writeFile(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error saving subtitle file:', error);
    return { success: false, error: error.message };
  }
})

ipcMain.handle("selectTxtFile", () => {
  return dialog.showOpenDialog({
    title: "Select subtitle file to import",
    buttonLabel: "Import",
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ["openFile"]
  });
})

ipcMain.handle("readTxtFile", async (event, filePath) => {
  const fs = require('fs').promises;
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return { success: true, content: content };
  } catch (error) {
    console.error('Error reading file:', error);
    return { success: false, error: error.message };
  }
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
      fullscreenable: true, 
      backgroundColor: settings.backgroundColor, 
      show: false,
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
    })
    projectionWindow.on("closed", () => {
      projectionWindow = null
      hideAllCSSKey = null
      isProjectionFullscreen = false
      if (mainWindow) {
        mainWindow.webContents.send("projectionWindowClosed");
        mainWindow.webContents.send("projectionFullscreenChanged", false);
      }
    })
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      projectionWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + 'projection.html')
    } else {
      projectionWindow.loadURL('app://./projection.html')
    }
    projectionWindow.on("ready-to-show", () => {
      // Use smart display selection for initial positioning
      const bestExternalDisplay = findBestExternalDisplay()
      if (bestExternalDisplay) {
        // Position on best external display but don't go fullscreen initially
        projectionWindow.setPosition(bestExternalDisplay.workArea.x, bestExternalDisplay.workArea.y);
      }
      // restore states
      projectionWindow.webContents.send("updateSettings", settings);
      if (muted && !hideAllCSSKey) {
        toggleHideAll()
      }
      setTimeout(() => {
        showSubtitle(currentSubtitle)
        showLowerThird(currentLowerThird)
        showImage(currentImage)
      }, 500)

      projectionWindow.show()
      if (mainWindow) {
        mainWindow.webContents.send("projectionWindowOpened");
      }
    })
  } else {
    projectionWindow.show()
    if (mainWindow) {
      mainWindow.webContents.send("projectionWindowOpened");
    }
  }
}

function closeProjection() {
  if (projectionWindow) {
    projectionWindow.close()
  }
}

function findBestExternalDisplay() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const externalDisplays = screen.getAllDisplays().filter(display => display.id !== primaryDisplay.id);
  
  if (externalDisplays.length === 0) return null;
  if (externalDisplays.length === 1) return externalDisplays[0];
  
  // Priority order for multiple external displays:
  // 1. Largest resolution (4K > 1080p > others)
  // 2. Rightmost position (typical projector setup)
  // 3. First detected external display
  
  return externalDisplays.sort((a, b) => {
    // Sort by resolution (area), then by x position
    const areaA = a.size.width * a.size.height;
    const areaB = b.size.width * b.size.height;
    if (areaA !== areaB) return areaB - areaA; // Larger first
    return b.bounds.x - a.bounds.x; // Rightmost first
  })[0];
}

async function toggleProjectionFullscreen(settings) {
  // If no projection window exists, create one first
  if (projectionWindow === null) {
    await showProjection(settings)
  }
  
  if (projectionWindow) {
    if (isProjectionFullscreen) {
      // Exit fullscreen and restore to normal window
      projectionWindow.setFullScreen(false)
      projectionWindow.setSize(800, 600)
      projectionWindow.center()
      isProjectionFullscreen = false
      
      if (mainWindow) {
        mainWindow.webContents.send("projectionFullscreenChanged", false)
      }
    } else {
      // Enter fullscreen mode with smart display selection
      const bestExternalDisplay = findBestExternalDisplay()
      
      if (bestExternalDisplay) {
        // Move to best external display and go full screen
        projectionWindow.setPosition(bestExternalDisplay.bounds.x, bestExternalDisplay.bounds.y)
        projectionWindow.setFullScreen(true)
        projectionWindow.show()
      } else {
        // No external display found, just go full screen on primary display
        projectionWindow.setFullScreen(true)
        projectionWindow.show()
      }
      
      isProjectionFullscreen = true
      
      if (mainWindow) {
        mainWindow.webContents.send("projectionFullscreenChanged", true)
        mainWindow.webContents.send("projectionWindowOpened")
      }
    }
  }
}

async function projectAtMax(settings) {
  // If no projection window exists, create one first
  if (projectionWindow === null) {
    await showProjection(settings)
  }
  
  if (projectionWindow) {
    // Use smart display selection for multiple external displays
    const bestExternalDisplay = findBestExternalDisplay()
    
    if (bestExternalDisplay) {
      // Move to best external display and go full screen
      projectionWindow.setPosition(bestExternalDisplay.bounds.x, bestExternalDisplay.bounds.y)
      projectionWindow.setFullScreen(true)
      projectionWindow.show()
      
      if (mainWindow) {
        mainWindow.webContents.send("projectionWindowOpened")
      }
    } else {
      // No external display found, just go full screen on primary display
      projectionWindow.setFullScreen(true)
      projectionWindow.show()
      
      if (mainWindow) {
        mainWindow.webContents.send("projectionWindowOpened")
      }
    }
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

ipcMain.on("showImage", (event, arg) => {
  showImage(arg)
})

async function showImage(item) {
  if (projectionWindow) {
    projectionWindow.webContents.send("showImage", item)
  }
  currentImage = item
}

ipcMain.on("updateSettings", (event, arg) => {
  if (projectionWindow) {
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
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  mainWindow.on("ready-to-show", () => {
    mainWindow.show()
  })

  mainWindow.on("closed", () => {
    if (projectionWindow) {
      projectionWindow.close()
    }
    mainWindow = null
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

  protocol.registerFileProtocol("atom", (request, callback) => {
    let path = request.url.substr(7);
    path = decodeURI(path)
    //console.log(path);
    callback(path);
  })

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
  globalShortcut.register('CommandOrControl+3', () => {
    mainWindow.webContents.send("clearImage")
  })
  globalShortcut.register('CommandOrControl+2', () => {
    mainWindow.webContents.send("clearSubtitle")
  })
  globalShortcut.register('CommandOrControl+1', () => {
    mainWindow.webContents.send("clearLowerThird")
  })
  globalShortcut.register('CommandOrControl+,', () => {
    mainWindow.webContents.send("openPreferences")
  })
  globalShortcut.register('CommandOrControl+P', () => {
    mainWindow.webContents.send("projectAtMax")
  })
  globalShortcut.register('CommandOrControl+C', () => {
    if (projectionWindow) {
      projectionWindow.close()
    }
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
