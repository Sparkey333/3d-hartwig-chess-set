import { app, BrowserWindow, shell, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;
const DMG_NAME = 'Neo-Chess-1.0.0-mac.dmg';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 640,
    title: 'Neo Chess',
    backgroundColor: '#0a0a0f',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  win.setMenuBarVisibility(false);

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

async function openLocalMacDmg() {
  const downloads = app.getPath('downloads');
  const candidates = [
    path.join(downloads, DMG_NAME),
    path.join(__dirname, '../Downloads', DMG_NAME),
    path.join(__dirname, '../dist/downloads', DMG_NAME),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      const err = await shell.openPath(candidate);
      if (err) throw new Error(err);
      return candidate;
    }
  }
  throw new Error('DMG not found in ~/Downloads. Run npm run pack:mac first.');
}

app.whenReady().then(() => {
  ipcMain.handle('neo:open-downloads-dmg', async () => openLocalMacDmg());
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
