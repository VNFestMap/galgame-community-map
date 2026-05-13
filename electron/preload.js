const { contextBridge } = require('electron');

// Expose a minimal desktop API to the renderer process.
// The web app doesn't need Electron-specific features currently,
// but this bridge is here for future use (notifications, file dialogs, etc.).

contextBridge.exposeInMainWorld('desktop', {
  platform: 'win32',
  isElectron: true,
});
