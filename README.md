# Node-Based Web Automations

Aplicação desktop para criação e execução de automações web através de um editor visual node-based. Construída com Electron e Puppeteer.

## Tech Stack

**Desktop:** Electron, electron-vite, TypeScript

**Frontend (Renderer):** React, React Flow (@xyflow), Shadcn UI, Tailwind CSS, TanStack React Query, Jotai, React Hook Form, Zod

**Backend (Main Process):** Puppeteer Core, Better SQLite3, Parcel Watcher

**Build & Release:** electron-builder, GitHub Actions (CI/CD de releases)

## Funcionalidades

- Editor visual drag-and-drop de workflows com React Flow
- Criação de nós customizados para ações de automação web (clique, navegação, extração de dados, etc.)
- Execução de workflows via Puppeteer com Chromium embarcado
- Histórico de execuções persistido em SQLite local
- Gerenciamento de workflows e nós reutilizáveis
- IPC tipado entre processo main e renderer
- Build multiplataforma (macOS, Windows, Linux) via electron-builder
- CI/CD com GitHub Actions para releases automáticos

## Arquitetura

```
src/
  main/                     # Processo principal Electron
    db/                     # Camada de dados SQLite (workflows, nodes, history)
    ipc/                    # Handlers IPC (chrome, executions, workflows, nodes, history)
    puppeteer/              # Gerenciamento do Chromium e execução de automações
    services/               # Regras de negócio (executions, workflows, nodes, history)

  preload/                  # Bridge seguro entre main e renderer (API exposta)

  renderer/                 # Interface React
    components/
      edges/                # Edges customizados do React Flow
      nodes/                # Nós de execução customizados
    hooks/                  # Custom hooks (queries, mutations)
    pages/                  # Páginas da aplicação
    stores/                 # Estado global (Jotai)
```

## Como Rodar

### Pré-requisitos
- Node.js 18+
- npm

### Setup

```bash
npm install
npm run dev                 # inicia em modo desenvolvimento (Electron + Vite)
```

### Build

```bash
npm run build               # gera executável para a plataforma atual
```

## Autor

**Lucas Silva** - [LinkedIn](https://www.linkedin.com/in/lucashs94/) | [GitHub](https://github.com/lucashs94) | h7.lucas@gmail.com
