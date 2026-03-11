
```text
$$$$$$$\ $$\     $$\  $$$$$$\  $$$$$$$\   $$$$$$\  $$\   $$\ $$\   $$\ $$$$$$$\  
$$  __$$\\$$\   $$  |$$  __$$\ $$  __$$\ $$  __$$\ $$ |  $$ |$$$\  $$ |$$  __$$\ 
$$ |  $$ |\$$\ $$  / $$ /  \__|$$ |  $$ |$$ /  $$ |$$ |  $$ |$$$$\ $$ |$$ |  $$ |
$$$$$$$  | \$$$$  /  $$ |$$$$\ $$$$$$$  |$$ |  $$ |$$ |  $$ |$$ $$\$$ |$$ |  $$ |
$$  ____/   \$$  /   $$ |\_$$ |$$  __$$< $$ |  $$ |$$ |  $$ |$$ \$$$$ |$$ |  $$ |
$$ |         $$ |    $$ |  $$ |$$ |  $$ |$$ |  $$ |$$ |  $$ |$$ |\$$$ |$$ |  $$ |
$$ |         $$ |    \$$$$$$  |$$ |  $$ | $$$$$$  |\$$$$$$  |$$ | \$$ |$$$$$$$  |
\__|         \__|     \______/ \__|  \__| \______/  \______/ \__|  \__|\_______/ 

```

**PyGround** é um playground Python moderno e minimalista que roda inteiramente no navegador. O objetivo é fornecer uma experiência visual e interativa para execução de código sem a necessidade de infraestruturas complexas de sandbox ou servidores backend pesados.

---

## 🚀 Funcionalidades

* **Execução Client-side**: Graças ao **Pyodide**, seu código Python roda direto no WebAssembly.
* **Terminal Integrado**: Experiência de console real com **XTerm.js**.
* **Editor Profissional**: Edição de código rica com **Monaco Editor** (o motor do VS Code).
* **Navegação de Arquivos**: Estrutura de diretórios fluida usando **React Arborist**.
* **Layout Adaptável**: Interface totalmente redimensionável com **React Resizable Panels**.
* **Integração com GitHub**: Carregue repositórios públicos diretamente pela URL.

---

## 🛠️ Stack Tecnológica

O projeto utiliza o que há de mais moderno no ecossistema Web para performance e UX:

| Ferramenta | Função |
| --- | --- |
| **Pyodide** | Interpretador Python via WebAssembly (WASM). |
| **XTerm.js** | Emulação de terminal para exibição de logs e outputs. |
| **Monaco Editor** | Editor de código com syntax highlighting e intellisense. |
| **React Arborist** | Gerenciamento visual da árvore de arquivos. |
| **Zustand** | Gerenciamento de estado leve e eficiente. |
| **React Resizable Panels** | Sistema de drag-and-drop para painéis da interface. |

---

## 🚦 Modos de Uso

A aplicação é roteada para aceitar diferentes contextos do GitHub de forma dinâmica:

* **Local puro**: `http://localhost:3000/`
* **Repositório Específico**: `http://localhost:3000/usuario/repo`
* **Branch Específica**: `http://localhost:3000/usuario/repo/main`
* **Com Flags de Configuração**:
* `?c=true`: Habilita persistência em cache.
* `?c=false`: Força o recarregamento dos arquivos.



---

## 📦 Instalação e Setup

Para replicar o ambiente ou instalar as dependências principais, execute:

```bash
# Dependências de UI e Editor
npm install react-arborist react-resizable-panels @monaco-editor/react@next

# Dependências de Terminal
npm install @xterm/xterm @xterm/addon-fit

# State Management e Hooks
npm install zustand use-resize-observer --legacy-peer-deps

```

---

## 🏗️ Arquitetura de Dados

A lógica principal reside na ponte entre o **Monaco Editor** (onde o usuário escreve), o **Pyodide** (que processa o código no worker) e o **XTerm.js** (que captura o `stdout` e exibe o resultado).

---