const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('neoDesktop', {
  openDownloadsDmg: () => ipcRenderer.invoke('neo:open-downloads-dmg'),
});
