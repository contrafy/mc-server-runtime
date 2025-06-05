// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('mcApi', {
  start:  () => ipcRenderer.invoke('mc:start'),
  stop:   () => ipcRenderer.invoke('mc:stop'),
  status: () => ipcRenderer.invoke('mc:status')
});