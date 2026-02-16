// app.js - Versão Final Corrigida
(function() {
    'use strict';

    console.log('🚀 Iniciando Code Playground...');

    // Configuração
    const isElectron = window.electronAPI !== undefined;
    let editor = null;
    let currentLanguage = 'javascript';

    // Templates de código
    const codeTemplates = {
        javascript: `// JavaScript - Hello World
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("CodePlay"));
console.log("2 + 2 =", 2 + 2);

// Array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);`,

        python: `# Python - Hello World
def greet(name):
    return f"Hello, {name}!"

print(greet("CodePlay"))
print(f"2 + 2 = {2 + 2}")

# List operations
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print(f"Doubled: {doubled}")`,

        html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            font-family: Arial; 
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .card {
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
        }
        h1 { color: #fff; margin-bottom: 20px; }
        button {
            padding: 12px 24px;
            background: white;
            color: #764ba2;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>🎨 HTML Preview</h1>
        <p>Funcionando no Electron!</p>
        <button onclick="alert('Hello from HTML!')">
            Clique aqui
        </button>
    </div>
</body>
</html>`
    };

    // Aguardar DOM carregar
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📝 DOM carregado, inicializando...');
        initializeMonaco();
    });

    // Inicializar Monaco Editor
    function initializeMonaco() {
        if (typeof monaco === 'undefined') {
            console.error('❌ Monaco Editor não carregado!');
            setTimeout(initializeMonaco, 200);
            return;
        }

        console.log('✅ Monaco Editor carregado, criando instância...');

        // Criar editor
        const editorElement = document.getElementById('editor');
        if (!editorElement) {
            console.error('❸ Elemento #editor não encontrado!');
            return;
        }

        editor = monaco.editor.create(editorElement, {
            value: codeTemplates.javascript,
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            fontFamily: 'Consolas, "Courier New", monospace',
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 4,
            renderWhitespace: 'selection'
        });

        console.log('✅ Editor criado com sucesso!');

        // Configurar atalhos
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function() {
            runCode();
        });

        // Inicializar event listeners
        setupEventListeners();
        updateLanguageBadge('javascript');
    }

    // Configurar event listeners
    function setupEventListeners() {
        console.log('🔌 Configurando event listeners...');

        // Language selector
        const languageSelect = document.getElementById('language');
        if (languageSelect) {
            languageSelect.addEventListener('change', function(e) {
                currentLanguage = this.value;
                if (editor) {
                    monaco.editor.setModelLanguage(editor.getModel(), currentLanguage);
                    updateLanguageBadge(currentLanguage);
                    
                    // Carregar template se vazio
                    if (editor.getValue().trim() === '' && codeTemplates[currentLanguage]) {
                        editor.setValue(codeTemplates[currentLanguage]);
                    }
                }
            });
        }

        // Run button
        const runBtn = document.getElementById('runBtn');
        if (runBtn) {
            runBtn.addEventListener('click', function(e) {
                e.preventDefault();
                runCode();
            });
        }

        // Save button
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function(e) {
                e.preventDefault();
                saveCode();
            });
        }

        // Clear button
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Tem certeza que deseja limpar o editor?')) {
                    editor.setValue('');
                }
            });
        }

        // Clear output button
        const clearOutputBtn = document.getElementById('clearOutputBtn');
        if (clearOutputBtn) {
            clearOutputBtn.addEventListener('click', function(e) {
                e.preventDefault();
                clearOutput();
            });
        }

        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const theme = this.dataset.theme;
                monaco.editor.setTheme(theme);
                
                document.querySelectorAll('.theme-btn').forEach(b => 
                    b.classList.remove('active')
                );
                this.classList.add('active');
            });
        });

        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const tab = this.dataset.tab;
                
                document.querySelectorAll('.tab-btn').forEach(b => 
                    b.classList.remove('active')
                );
                this.classList.add('active');
                
                document.getElementById('output').classList.toggle('hidden', tab !== 'output');
                document.getElementById('console').classList.toggle('hidden', tab !== 'console');
                document.getElementById('problems').classList.toggle('hidden', tab !== 'problems');
            });
        });

        // Examples list
        document.querySelectorAll('#examplesList li').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const text = this.textContent.toLowerCase();
                let example = 'hello-world';
                if (text.includes('loop')) example = 'loop';
                if (text.includes('function')) example = 'function';
                if (text.includes('class')) example = 'class';
                loadExample(example);
            });
        });

        // Electron menu events
        if (isElectron && window.electronAPI) {
            window.electronAPI.onRunCode(runCode);
            window.electronAPI.onClearOutput(clearOutput);
            window.electronAPI.onSaveFile(saveCode);
            window.electronAPI.onNewFile(function() {
                if (confirm('Criar novo arquivo?')) {
                    editor.setValue('');
                }
            });
            window.electronAPI.onOpenFile(function(event, data) {
                editor.setValue(data.content);
                if (data.language) {
                    document.getElementById('language').value = data.language;
                    monaco.editor.setModelLanguage(editor.getModel(), data.language);
                    updateLanguageBadge(data.language);
                }
            });
        }

        console.log('✅ Event listeners configurados!');
    }

    // Função de execução
    function runCode() {
        if (!editor) {
            showNotification('Editor não inicializado', 'error');
            return;
        }

        const code = editor.getValue();
        const language = currentLanguage;

        if (!code.trim()) {
            showNotification('Digite algum código!', 'warning');
            return;
        }

        clearOutput();
        appendToOutput(`🚀 Executando ${language}...\n`);

        try {
            if (language === 'javascript') {
                // Capturar console.log
                const originalLog = console.log;
                let output = '';
                
                console.log = function(...args) {
                    output += args.map(arg => {
                        if (typeof arg === 'object') {
                            try {
                                return JSON.stringify(arg, null, 2);
                            } catch {
                                return String(arg);
                            }
                        }
                        return String(arg);
                    }).join(' ') + '\n';
                };

                // Executar código
                const result = eval(code);

                // Restaurar console
                console.log = originalLog;

                if (result !== undefined) {
                    output += `\n➡ Return: ${JSON.stringify(result, null, 2)}`;
                }

                displayOutput(output || '✅ Executado com sucesso!');
                appendToConsole(output);

            } else if (language === 'html') {
                displayHTMLPreview(code);

            } else {
                displayOutput(`⚡ Execução para ${language} em desenvolvimento...`);
            }

        } catch (error) {
            displayError(error.message);
        }
    }

    // Funções de display
    function displayOutput(text) {
        const outputDiv = document.getElementById('output');
        if (outputDiv) {
            outputDiv.innerHTML = `<pre class="output-text" style="margin:0; font-family:monospace;">${escapeHTML(text)}</pre>`;
        }
    }

    function displayHTMLPreview(html) {
        const outputDiv = document.getElementById('output');
        if (outputDiv) {
            outputDiv.innerHTML = `
                <div class="html-preview" style="width:100%; height:100%; background:white;">
                    <iframe srcdoc="${escapeHTML(html)}" 
                            width="100%" 
                            height="100%" 
                            style="border:none; background:white;"
                            sandbox="allow-scripts allow-same-origin">
                    </iframe>
                </div>
            `;
        }
    }

    function displayError(error) {
        const outputDiv = document.getElementById('output');
        if (outputDiv) {
            outputDiv.innerHTML = `
                <div class="error-container" style="padding:20px; color:#dc3545;">
                    <i class="fas fa-exclamation-circle" style="font-size:24px;"></i>
                    <pre class="error-message" style="background:#2d2d2d; padding:10px; border-radius:5px; margin-top:10px;">${escapeHTML(error)}</pre>
                </div>
            `;
        }
        
        const problemsDiv = document.getElementById('problems');
        if (problemsDiv) {
            problemsDiv.innerHTML = `
                <div class="problem-item error" style="color:#dc3545; padding:8px;">
                    <i class="fas fa-times-circle"></i>
                    <span>${escapeHTML(error)}</span>
                </div>
            `;
        }
    }

    function clearOutput() {
        document.getElementById('output').innerHTML = `
            <div class="welcome-message" style="text-align:center; padding:40px; color:#666;">
                <i class="fas fa-terminal" style="font-size:48px;"></i>
                <p>Execute seu código para ver resultados</p>
            </div>
        `;
        document.getElementById('console').innerHTML = '';
        document.getElementById('problems').innerHTML = '';
    }

    function appendToOutput(text) {
        const outputDiv = document.getElementById('output');
        if (outputDiv && !outputDiv.querySelector('.welcome-message')) {
            outputDiv.innerHTML += `<div>${escapeHTML(text)}</div>`;
        }
    }

    function appendToConsole(text) {
        const consoleDiv = document.getElementById('console');
        if (consoleDiv) {
            consoleDiv.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${escapeHTML(text)}</div>`;
        }
    }

    // Salvar código
    function saveCode() {
        if (!editor) return;
        
        const code = editor.getValue();
        const ext = getFileExtension(currentLanguage);
        
        if (isElectron && window.electronAPI) {
            window.electronAPI.saveFile({
                content: code,
                defaultPath: `codigo.${ext}`
            }).then(result => {
                if (result.success) {
                    showNotification('💾 Arquivo salvo!', 'success');
                }
            }).catch(err => {
                showNotification('Erro ao salvar: ' + err.message, 'error');
            });
        } else {
            // Fallback para download
            const blob = new Blob([code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `codigo.${ext}`;
            a.click();
            URL.revokeObjectURL(url);
            showNotification('💾 Download iniciado!', 'success');
        }
    }

    // Carregar exemplo
    function loadExample(name) {
        const examples = {
            'hello-world': {
                javascript: 'console.log("Hello, World!");',
                python: 'print("Hello, World!")',
                html: '<h1>Hello World</h1>'
            },
            'loop': {
                javascript: 'for(let i=1; i<=5; i++) {\n    console.log(`Count: ${i}`);\n}',
                python: 'for i in range(1,6):\n    print(f"Count: {i}")'
            },
            'function': {
                javascript: 'function add(a, b) {\n    return a + b;\n}\n\nconsole.log(add(5, 3));',
                python: 'def add(a, b):\n    return a + b\n\nprint(add(5, 3))'
            },
            'class': {
                javascript: 'class Person {\n    constructor(name) {\n        this.name = name;\n    }\n    \n    greet() {\n        return `Hello, ${this.name}`;\n    }\n}\n\nconst p = new Person("John");\nconsole.log(p.greet());',
                python: 'class Person:\n    def __init__(self, name):\n        self.name = name\n    \n    def greet(self):\n        return f"Hello, {self.name}"\n\np = Person("John")\nprint(p.greet())'
            }
        };

        if (examples[name] && examples[name][currentLanguage]) {
            editor.setValue(examples[name][currentLanguage]);
            showNotification(`📚 Exemplo "${name}" carregado!`, 'success');
        }
    }

    // Utilitários
    function showNotification(message, type = 'info') {
        const colors = {
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545',
            info: '#007acc'
        };

        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${colors[type] || colors.info};
            color: white;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getFileExtension(language) {
        const map = {
            javascript: 'js',
            python: 'py',
            java: 'java',
            cpp: 'cpp',
            html: 'html',
            css: 'css'
        };
        return map[language] || 'txt';
    }

    function updateLanguageBadge(language) {
        const badge = document.querySelector('.language-badge');
        const fileName = document.querySelector('.file-name');
        
        const names = {
            javascript: 'JavaScript',
            python: 'Python',
            java: 'Java',
            cpp: 'C++',
            html: 'HTML/CSS'
        };
        
        if (badge) badge.textContent = names[language] || language;
        if (fileName) fileName.textContent = `script.${getFileExtension(language)}`;
    }

    // Adicionar animações CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    console.log('🎯 Code Playground inicializado com sucesso!');
})();