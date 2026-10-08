// Electron Main Process for Melo Reader
import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

function getTargetFile() {
  // Check if a file was passed as argument (e.g. MeloReader.exe "document.md")
  const args = process.argv.slice(app.isPackaged ? 1 : 2);
  for (const arg of args) {
    if (arg && !arg.startsWith('--') && fs.existsSync(arg)) {
      try {
        const stat = fs.statSync(arg);
        if (stat.isFile()) {
          return {
            filename: path.basename(arg),
            content: fs.readFileSync(arg, 'utf-8')
          };
        }
      } catch (e) {}
    }
  }
  return null;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0b0c16',
    show: false,
    autoHideMenuBar: true,
    title: 'Melo Reader 🚀',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  // Remove default menu bar for a clean modern app look
  Menu.setApplicationMenu(null);

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();

    // Send target file if opened via argument
    const targetFile = getTargetFile();
    if (targetFile) {
      mainWindow.webContents.send('load-file-content', targetFile);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      // Check if second instance was opened with a file
      const fileArg = commandLine.find(arg => arg && !arg.startsWith('--') && fs.existsSync(arg));
      if (fileArg) {
        try {
          const content = fs.readFileSync(fileArg, 'utf-8');
          mainWindow.webContents.send('load-file-content', {
            filename: path.basename(fileArg),
            content: content
          });
        } catch (e) {}
      }
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
