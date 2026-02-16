<div align="center">
  <h1> Code Playground Pro</h1>
  <p>Um playground de código desktop multi-linguagem, poderoso e elegante</p>

  <a href="#"><img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Electron-27.0.0-47848F?style=for-the-badge&logo=electron&logoColor=white" alt="Electron"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Node.js-16%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge" alt="License"/></a>
  <a href="#"><img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=for-the-badge" alt="Platform"/></a>

  <br/><br/>

  <p>
    <a href="#-funcionalidades">Funcionalidades</a> •
    <a href="#-instalação">Instalação</a> •
    <a href="#-como-usar">Como Usar</a> •
    <a href="#-estrutura-do-projeto">Estrutura</a> •
    <a href="#-compilar-para-produção">Build</a> •
    <a href="#-tecnologias">Tecnologias</a>
  </p>
</div>

---

## 📸 Demonstração

>  **Dica:** Adicione aqui um GIF ou screenshot do app em funcionamento.
> `![Demo](./assets/demo.gif)`

---

##  Funcionalidades

###  Linguagens Suportadas

| Linguagem    | Suporte     | Modo de Execução |
|--------------|:-----------:|:----------------:|
| JavaScript   |  Completo | Local (V8)       |
| Python       |  Completo | Backend          |
| Java         |  Completo | Backend          |
| C++          |  Completo | Backend          |
| HTML / CSS   |  Completo | Preview Local    |

### 🛠️ Editor

- **CodeMirror** com syntax highlighting para todas as linguagens
- **Temas** Dark *(Dracula)* e Light *(Eclipse)*
- **Contador** de linhas e caracteres em tempo real
- **Status bar** com informações da sessão atual

### Produtividade

-  Executar código com **F5**, **Ctrl+Enter** ou pelo botão na tela
-  **Salvar** e **Abrir** arquivos diretamente do sistema
-  **Copiar** código para a área de transferência com um clique
-  **Exemplos prontos** para cada linguagem

### ⌨️ Atalhos de Teclado

| Atalho           | Ação              |
|:----------------:|-------------------|
| `F5`             | Executar código   |
| `Ctrl` + `Enter` | Executar código   |
| `Ctrl` + `S`     | Salvar arquivo    |
| `Ctrl` + `O`     | Abrir arquivo     |

---

##  Instalação

### Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

| Ferramenta | Versão Mínima | Necessário para |
|:----------:|:-------------:|-----------------|
| [Node.js](https://nodejs.org) | `16+` | Executar o app |
| [Python](https://python.org) | `3.8+` | Executar código Python |
| [Java JDK](https://adoptium.net) | `11+` | Executar código Java |
| [G++ / GCC](https://gcc.gnu.org) | — | Executar código C++ |
| [Git](https://git-scm.com) | — | Clonar o repositório |

### Início Rápido

```bash
# Clone o repositório
git clone https://github.com/PedroNagatomo/code-playground-pro.git
cd code-playground-pro

# Instale as dependências principais
npm install

# Instale as dependências do backend
cd backend && npm install && cd ..

# Inicie o aplicativo
npm start
```

---

##  Como Usar

**1. Selecione a linguagem** no menu suspenso da barra de ferramentas.

**2. Escreva ou cole seu código** no editor.

**3. Execute** com `F5`, `Ctrl+Enter` ou o botão **Run**.

**4. Veja o resultado** no painel de saída abaixo do editor.

> Para carregar um exemplo, clique em **"Exemplos"** na barra de ferramentas — o editor será preenchido automaticamente com um código de demonstração da linguagem selecionada.

---

##  Estrutura do Projeto

```
code-playground-pro/
│
├── backend/               # Servidor para execução de código compilado/interpretado
│   ├── server.js          # API REST (Python, Java, C++)
│   └── package.json
│
├── database/              # Configurações e modelos de banco de dados
│
├── frontend/              # Interface do usuário (HTML, CSS, JS)
│
├── main.js                # Processo principal do Electron
├── preload.js             # Bridge segura entre renderer e processo main
└── package.json
```

---

##  Compilar para Produção

```bash
# Para a plataforma atual
npm run build

# Windows
npm run build -- --win

# macOS
npm run build -- --mac

# Linux
npm run build -- --linux
```

> Os arquivos gerados ficam na pasta `dist/`. Para compilar para outras plataformas pode ser necessário configurar dependências adicionais do `electron-builder`.

---

##  Tecnologias

<div align="center">

| Tecnologia | Versão | Uso |
|:----------:|:------:|-----|
| [Electron](https://www.electronjs.org/) | `27.0.0` | Framework desktop multiplataforma |
| [Node.js](https://nodejs.org/) | `16+` | Runtime e backend de execução |
| [CodeMirror](https://codemirror.net/) | — | Editor com syntax highlighting |
| [Express](https://expressjs.com/) | — | API REST para execução de código |

</div>
