// Configuração do Monaco Editor
let editor;
let currentLanguage = 'javascript';
let socket;

// Templates de código por linguagem
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

    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodePlay!");
        System.out.println("2 + 2 = " + (2 + 2));
        
        // Array operations
        int[] numbers = {1, 2, 3, 4, 5};
        System.out.print("Doubled: ");
        for(int n : numbers) {
            System.out.print((n * 2) + " ");
        }
    }
}`,

    cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    cout << "Hello, CodePlay!" << endl;
    cout << "2 + 2 = " << 2 + 2 << endl;
    
    // Vector operations
    vector<int> numbers = {1, 2, 3, 4, 5};
    cout << "Doubled: ";
    for(int n : numbers) {
        cout << n * 2 << " ";
    }
    
    return 0;
}`,

    html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            text-align: center;
            padding: 40px;
            border-radius: 10px;
            background: rgba(255,255,255,0.1);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        h1 {
            color: #007acc;
            margin-bottom: 20px;
        }
        button {
            padding: 12px 24px;
            background: #007acc;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: transform 0.3s;
        }
        button:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Code Playground Pro</h1>
        <p>HTML/CSS Preview funcionando!</p>
        <button onclick="alert('Hello from CodePlay!')">
            Clique aqui
        </button>
    </div>
</body>
</html>`
};

// Inicialização do Monaco
require.config({ 
    paths: { 
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.1/min/vs' 
    } 
});

require(['vs/editor/editor.main'], function() {
    // Criar instância do editor
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: codeTemplates['javascript'],
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Consolas, "Courier New", monospace',
        fontLigatures: true,
        minimap: { enabled: false },
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: false,
        cursorStyle: 'line',
        cursorBlinking: 'smooth',
        renderWhitespace: 'selection',
        bracketPairColorization: { enabled: true },
        renderLineHighlight: 'all',
        tabSize: 4,
        wordWrap: 'on'
    });

    // Configurar atalhos
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function() {
        runCode();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function() {
        saveCode();
    });

    // Evento de mudança de linguagem
    window.addEventListener('languageChange', function(e) {
        const lang = e.detail.language;
        monaco.editor.setModelLanguage(editor.getModel(), lang);
        updateLanguageBadge(lang);
    });
});

// Função para atualizar badge da linguagem
function updateLanguageBadge(language) {
    const badge = document.querySelector('.language-badge');
    const langNames = {
        javascript: 'JavaScript',
        python: 'Python',
        java: 'Java',
        cpp: 'C++',
        html: 'HTML/CSS'
    };
    badge.textContent = langNames[language] || language;
    document.querySelector('.file-name').textContent = `script.${getFileExtension(language)}`;
}

// Função para obter extensão de arquivo
function getFileExtension(language) {
    const extensions = {
        javascript: 'js',
        python: 'py',
        java: 'java',
        cpp: 'cpp',
        html: 'html'
    };
    return extensions[language] || 'txt';
}

// Função para carregar exemplos
function loadExample(exampleName) {
    const language = document.getElementById('language').value;
    
    const examples = {
        'hello-world': {
            javascript: 'console.log("Hello, World!");',
            python: 'print("Hello, World!")',
            java: 'public class Main { public static void main(String[] args) { System.out.println("Hello, World!"); } }',
            cpp: '#include <iostream>\nint main() { std::cout << "Hello, World!" << std::endl; return 0; }'
        },
        'loop': {
            javascript: 'for(let i = 1; i <= 5; i++) {\n    console.log(`Count: ${i}`);\n}',
            python: 'for i in range(1, 6):\n    print(f"Count: {i}")'
        }
    };
    
    if (examples[exampleName] && examples[exampleName][language]) {
        editor.setValue(examples[exampleName][language]);
    }
}