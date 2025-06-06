import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

import os from 'node:os';
import stream from "stream";

// import Docker from 'dockerode';
import Docker, { DockerOptions } from 'dockerode'; // using require to avoid ESM issues with dockerode

function getDockerOptions(): DockerOptions {
  const platform = os.platform();

  if (platform === 'win32') {
    // Use named pipe on Windows
    console.log('Detected Windows environment');
    return { socketPath: '//./pipe/docker_engine' };
  }

  // Check for Docker Desktop on WSL2 (shared socket)
  if (platform === 'linux' && process.env.WSL_DISTRO_NAME) {
    console.log('Detected WSL2 environment');
    return { socketPath: '/mnt/wsl/docker-desktop/shared-sockets/guest-services/docker.sock' };
  }

  // Default to standard Unix socket
  console.log('Detected Unix-like environment (Linux, macOS)');
  return { socketPath: '/var/run/docker.sock' };
}

const docker = new Docker(getDockerOptions()); // talks to local /var/run/docker.sock by default
const CONTAINER_NAME = 'mc_launcher_server';

/* ───────── Log streaming helpers ───────── */
function broadcast(channel: string, payload?: unknown) {
  BrowserWindow.getAllWindows().forEach(w => w.webContents.send(channel, payload));
}

function broadcastLogStream() {
  const cont = docker.getContainer(CONTAINER_NAME);

  cont.inspect((err, info) => {
    if (err || !info.State.Running) return;  // nothing to stream yet

    cont.logs(
      { follow: true, stdout: true, stderr: true, tail: 10 },
      (e: Error | null, logStream?: stream.Readable) => {
        if (e || !logStream) {
          broadcast("mc:logs:data", `⚠️  ${e?.message ?? "no logs"}`);
          return;
        }

        logStream.on("data", chunk => {
          const line = chunk.slice(8).toString("utf8");
          line.split(/\r?\n/).forEach((l: string) => l && broadcast("mc:logs:data", l));
        });

        logStream.on("end", () => broadcast("mc:logs:data", "[log stream ended]"));

        // clean up when all windows gone
        app.once("before-quit", () => logStream.destroy());
      }
    );
  });
}

async function up() {
  // Re‑use container if it’s already there
  broadcast("mc:logs:clear");   // wipe old logs

  let container = docker.getContainer(CONTAINER_NAME);
  try { await container.inspect(); }
  catch {           // not found ⇒ create
    broadcast("mc:logs:clear");   // wipe old logs
    container = await docker.createContainer({
      Image: 'itzg/minecraft-server',
      name:  CONTAINER_NAME,
      Env:   ['EULA=TRUE'],        // add more later
      HostConfig: {
        PortBindings: { '25565/tcp': [{ HostPort: '25565' }] }
      }
    });
  }
  await container.start();

  broadcastLogStream();         // start fresh stream

  return container;
}

async function status() {
  try {
    const data = await docker.getContainer(CONTAINER_NAME).inspect();
    return { running: data.State.Running, status: data.State.Status };
  } catch {
    return { running: false, status: 'not-created' };
  }
}

async function down() {
  try {
    const c = docker.getContainer(CONTAINER_NAME);
    await c.stop();
    await c.remove({ force: true });
  } catch {/* noop */}
  broadcast("mc:logs:clear");   // clear textarea when stopped
}

/* ---------- IPC plumbing ---------- */
ipcMain.on("mc:logs:subscribe", e => {});
ipcMain.handle('mc:start', async () => {
  await up();
  return { started: true };
});
ipcMain.handle('mc:stop',   () => down()   );
ipcMain.handle('mc:status', () => status() );

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  // const MAIN_WINDOW_VITE_DEV_SERVER_URL = process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL;
  // const MAIN_WINDOW_VITE_NAME = process.env.MAIN_WINDOW_VITE_NAME || 'main';
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
  
  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
