const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

let mainWindow = null;
const REMOTE_APP_URL = 'https://www.map.vnfest.top/index.html';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: '全国 Galgame 同好会地图 — VNFest',
    icon: path.join(__dirname, '..', 'www', 'images', 'logo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  });

  // Prefer the live site so auth cookies stay same-origin in the desktop app.
  // Fall back to bundled www/ if the network entry cannot be loaded.
  const indexPath = path.join(__dirname, '..', 'www', 'index.html');
  let didFallbackToLocal = false;
  mainWindow.webContents.once('did-fail-load', () => {
    if (didFallbackToLocal) return;
    didFallbackToLocal = true;
    mainWindow.loadFile(indexPath);
  });
  mainWindow.loadURL(REMOTE_APP_URL);

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
