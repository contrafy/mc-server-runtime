// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('mcApi', {
  start:  () => ipcRenderer.invoke('mc:start'),
  stop:   () => ipcRenderer.invoke('mc:stop'),
  status: () => ipcRenderer.invoke('mc:status'),

  /* log helpers */
  subscribeLogs: () => ipcRenderer.send("mc:logs:subscribe"),

  onLogLine(cb: (l: string) => void) {
    const listener = (_: unknown, line: string) => cb(line);
    ipcRenderer.on("mc:logs:data", listener);
    return () => ipcRenderer.removeListener("mc:logs:data", listener);
  },

  onLogsClear(cb: () => void) {
    const listener = () => cb();
    ipcRenderer.on("mc:logs:clear", listener);
    return () => ipcRenderer.removeListener("mc:logs:clear", listener);
  }
});