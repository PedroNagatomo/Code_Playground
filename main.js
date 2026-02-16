const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

// Função para iniciar o backend
function startBackend() {
    return new Promise((resolve, reject) => {
        try {
            console.log('🚀 Iniciando backend...');
            
            // Caminho para o server.js
            const serverPath = path.join(__dirname, 'backend', 'server.js');
            
            if (!fs.existsSync(serverPath)) {
                console.log('⚠️ Backend não encontrado, executando apenas frontend');
                resolve();
                return;
            }

            // Verificar se Python está instalado
            const checkPython = spawn('python', ['--version']);
            checkPython.on('error', () => {
                console.log('⚠️ Python não encontrado, algumas funcionalidades podem não funcionar');
            });

            // Verificar se Java está instalado
            const checkJava = spawn('java', ['-version']);
            checkJava.on('error', () => {
                console.log('⚠️ Java não encontrado, algumas funcionalidades podem não funcionar');
            });

            // Iniciar backend
            backendProcess = spawn('node', [serverPath], {
                stdio: 'pipe',
                env: {
                    ...process.env,
                    ELECTRON_RUN: 'true',
                    PORT: '3001'
                },
                windowsHide: true,
                detached: false
            });

            backendProcess.stdout.on('data', (data) => {
                console.log(`[Backend] ${data.toString().trim()}`);
            });

            backendProcess.stderr.on('data', (data) => {
                console.error(`[Backend Erro] ${data.toString().trim()}`);
            });

            backendProcess.on('error', (err) => {
                console.error('❌ Erro no backend:', err);
                resolve(); // Continua mesmo sem backend
            });

            backendProcess.on('close', (code) => {
                console.log(`Backend encerrado com código ${code}`);
            });

            // Aguardar backend iniciar
            setTimeout(resolve, 2000);

        } catch (error) {
            console.error('Erro ao iniciar backend:', error);
            resolve(); // Continua mesmo com erro
        }
    });
}

// Criar janela principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false
        },
        backgroundColor: '#1e1e1e',
        show: false,
        title: 'Code Playground Pro'
    });

    // Menu personalizado
    const menuTemplate = [
        {
            label: 'Arquivo',
            submenu: [
                {
                    label: 'Novo',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => mainWindow.webContents.send('menu-new-file')
                },
                {
                    label: 'Abrir',
                    accelerator: 'CmdOrCtrl+O',
                    click: async () => {
                        const result = await dialog.showOpenDialog(mainWindow, {
                            properties: ['openFile'],
                            filters: [
                                { name: 'Código', extensions: ['js', 'py', 'java', 'cpp', 'html', 'css'] },
                                { name: 'Todos', extensions: ['*'] }
                            ]
                        });
                        
                        if (!result.canceled) {
                            try {
                                const content = fs.readFileSync(result.filePaths[0], 'utf-8');
                                const ext = path.extname(result.filePaths[0]).substring(1);
                                const langMap = { 
                                    'js': 'javascript', 
                                    'py': 'python', 
                                    'java': 'java', 
                                    'cpp': 'cpp', 
                                    'html': 'html',
                                    'css': 'css' 
                                };
                                
                                mainWindow.webContents.send('open-file', {
                                    content: content,
                                    language: langMap[ext] || 'javascript'
                                });
                            } catch (err) {
                                dialog.showErrorBox('Erro', err.message);
                            }
                        }
                    }
                },
                {
                    label: 'Salvar',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => mainWindow.webContents.send('menu-save-file')
                },
                {
                    label: 'Salvar Como',
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: () => mainWindow.webContents.send('menu-save-as')
                },
                { type: 'separator' },
                {
                    label: 'Sair',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        if (backendProcess) backendProcess.kill();
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Executar',
            submenu: [
                {
                    label: 'Executar Código',
                    accelerator: 'F5',
                    click: () => mainWindow.webContents.send('menu-run-code')
                },
                {
                    label: 'Limpar Output',
                    accelerator: 'CmdOrCtrl+L',
                    click: () => mainWindow.webContents.send('menu-clear-output')
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                { label: 'Ferramentas Dev', accelerator: 'F12', role: 'toggleDevTools' },
                { type: 'separator' },
                { label: 'Zoom +', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                { label: 'Zoom -', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                { label: 'Zoom 0', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' }
            ]
        },
        {
            label: 'Ajuda',
            submenu: [
                {
                    label: 'Sobre',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            title: 'Sobre',
                            message: 'Code Playground Pro',
                            detail: 'Versão 1.0.0\n\nUm playground de código multi-linguagem\nSuporta: JavaScript, Python, Java, C++, HTML',
                            buttons: ['OK']
                        });
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // Carregar frontend
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'index.html'));

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    setupIPC();
}

// Configurar comunicação
function setupIPC() {
    ipcMain.handle('save-file', async (event, { content, defaultPath }) => {
        try {
            const result = await dialog.showSaveDialog(mainWindow, {
                defaultPath: defaultPath || 'codigo.js',
                filters: [
                    { name: 'Arquivos de Código', extensions: ['js', 'py', 'java', 'cpp', 'html', 'css'] }
                ]
            });
            
            if (!result.canceled) {
                fs.writeFileSync(result.filePath, content, 'utf-8');
                return { success: true, path: result.filePath };
            }
            return { success: false };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('check-backend', () => {
        return { running: !!backendProcess };
    });

    ipcMain.handle('get-app-path', () => {
        return {
            userData: app.getPath('userData'),
            documents: app.getPath('documents'),
            temp: app.getPath('temp')
        };
    });
}

// Iniciar app
app.whenReady().then(async () => {
    await startBackend();
    createWindow();
});

app.on('window-all-closed', () => {
    if (backendProcess) backendProcess.kill();
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Limpar ao fechar
app.on('before-quit', () => {
    if (backendProcess) backendProcess.kill();
});