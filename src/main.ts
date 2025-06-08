import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

import os from 'node:os';
import fs from 'node:fs';
import { Readable as NodeStream } from "node:stream";

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

  // rootless docker setup
  const xdgRuntime = process.env.XDG_RUNTIME_DIR;         // /run/user/$UID
  if (xdgRuntime) {
    const rootlessSock = path.join(xdgRuntime, 'docker.sock');
    if (fs.existsSync(rootlessSock)) {
      return { socketPath: rootlessSock };
    }
  }

  // Default to standard Unix socket
  console.log('Detected Unix-like environment (Linux, macOS)');
  return { socketPath: '/var/run/docker.sock' };
}

const docker = new Docker(getDockerOptions()); // talks to local /var/run/docker.sock by default
const CONTAINER_NAME = 'mc_launcher_server';
const IMAGE   = 'itzg/minecraft-server';

let liveLogStream: NodeStream | null = null;

/* ───────── Log streaming helpers ───────── */
function broadcast(channel: string, payload?: unknown) {
  BrowserWindow.getAllWindows().forEach(w => w.webContents.send(channel, payload));
}

function broadcastLogStream() {
  // close any previous stream
  liveLogStream?.destroy();

  const cont = docker.getContainer(CONTAINER_NAME);
  cont.logs(
    { follow: true, stdout: true, stderr: true, tail: 10 },
    (err, stream?: NodeStream) => {
      if (err || !stream) {
        broadcast("mc:logs:data", `⚠️  ${err?.message ?? "no logs"}`);
        return;
      }

      liveLogStream = stream;

      stream.on("data", chunk => {
        // first 8 bytes are Docker's multiplex header
        const text = chunk.slice(8).toString("utf8");
        text.split(/\r?\n/).forEach(l => l && broadcast("mc:logs:data", l));
      });

      stream.on("end", () => broadcast("mc:logs:data", "[log stream ended]"));
      app.once("before-quit", () => stream.destroy());
    }
  );
}

/**
 * Pull IMAGE only if it is not already present locally.
 */
async function ensureImage(imageName: string) {
  try {
    await docker.getImage(imageName).inspect();         // already there → OK
    return;
  } catch (_) {
    // Absent → pull it
    console.log(`Pulling ${imageName} …`);
    await new Promise<void>((resolve, reject) => {
      docker.pull(imageName, (err: any, stream: any) => {
        if (err) return reject(err);
        // followProgress gives you a single callback when done
        docker.modem.followProgress(stream, (err) =>
          err ? reject(err) : resolve()
        );
      });
    });
  }
}

async function up() {
  // Re‑use container if it’s already there
  let container = docker.getContainer(CONTAINER_NAME);

  try { 
    await container.inspect(); 
  }
  catch {           // not found ⇒ create
    await ensureImage(IMAGE);
    
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
      nodeIntegration: true,
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
