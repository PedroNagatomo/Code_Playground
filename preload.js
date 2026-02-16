const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveFile: (data) => ipcRenderer.invoke('save-file', data),
    onNewFile: (callback) => {
        ipcRenderer.removeAllListeners('menu-new-file');
        ipcRenderer.on('menu-new-file', callback);
    },
    onSaveFile: (callback) => {
        ipcRenderer.removeAllListeners('menu-save-file');
        ipcRenderer.on('menu-save-file', callback);
    },
    onRunCode: (callback) => {
        ipcRenderer.removeAllListeners('menu-run-code');
        ipcRenderer.on('menu-run-code', callback);
    },
    onClearOutput: (callback) => {
        ipcRenderer.removeAllListeners('menu-clear-output');
        ipcRenderer.on('menu-clear-output', callback);
    },
    onOpenFile: (callback) => {
        ipcRenderer.removeAllListeners('open-file');
        ipcRenderer.on('open-file', callback);
    }
});

contextBridge.exposeInMainWorld('env', {
    isElectron: true
});