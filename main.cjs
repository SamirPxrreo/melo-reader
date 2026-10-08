// Electron Main Process for Melo Reader (CommonJS)
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

process.on('uncaughtException', (err) => {
  try {
    fs.writeFileSync(path.join(__dirname, 'electron-crash.log'), 'Uncaught: ' + (err.stack || err.toString()));
  } catch (e) {}
});

process.on('unhandledRejection', (err) => {
  try {
    fs.writeFileSync(path.join(__dirname, 'electron-crash.log'), 'Rejection: ' + (err.stack || err.toString()));
  } catch (e) {}
});

let mainWindow = null;

function getTargetFile() {
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
  try {
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 850,
      minWidth: 800,
      minHeight: 600,
      backgroundColor: '#0b0c16',
      autoHideMenuBar: true,
      title: 'Melo Reader 🚀',
      icon: path.join(__dirname, 'assets', 'icon.png'),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false
      }
    });

    Menu.setApplicationMenu(null);

    const indexPath = path.join(__dirname, 'index.html');
    mainWindow.loadFile(indexPath);

    mainWindow.webContents.on('did-finish-load', () => {
      const targetFile = getTargetFile();
      if (targetFile) {
        mainWindow.webContents.send('load-file-content', targetFile);
      }
    });

    mainWindow.webContents.on('did-fail-load', (e, code, desc) => {
      fs.writeFileSync(path.join(__dirname, 'electron-crash.log'), `Load failed: ${code} - ${desc}`);
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  } catch (err) {
    fs.writeFileSync(path.join(__dirname, 'electron-crash.log'), 'createWindow error: ' + err.stack);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch(err => {
  fs.writeFileSync(path.join(__dirname, 'electron-crash.log'), 'app.ready error: ' + err.stack);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
