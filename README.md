# Autoflow

A desktop application for creating and running web automations through a visual node-based editor. Built with Electron and Puppeteer.

## Tech Stack

**Desktop:** Electron, electron-vite, TypeScript

**Frontend (Renderer):** React, React Flow (@xyflow), Shadcn UI, Tailwind CSS, TanStack React Query, Jotai, React Hook Form, Zod

**Backend (Main Process):** Puppeteer Core, Better SQLite3, Parcel Watcher

**Build & Release:** electron-builder, GitHub Actions (release CI/CD)

## Features

- Visual drag-and-drop workflow editor with React Flow
- Custom nodes for web automation actions (click, navigation, data extraction, etc.)
- Workflow execution via Puppeteer with embedded Chromium
- Execution history persisted in local SQLite
- Workflow and reusable node management
- Typed IPC between main and renderer processes
- Cross-platform builds (macOS, Windows, Linux) via electron-builder
- CI/CD with GitHub Actions for automated releases

## Architecture

```
src/
  main/                     # Electron main process
    db/                     # SQLite data layer (workflows, nodes, history)
    ipc/                    # IPC handlers (chrome, executions, workflows, nodes, history)
    puppeteer/              # Chromium management and automation execution
    services/               # Business logic (executions, workflows, nodes, history)

  preload/                  # Secure bridge between main and renderer (exposed API)

  renderer/                 # React interface
    components/
      edges/                # Custom React Flow edges
      nodes/                # Custom execution nodes
    hooks/                  # Custom hooks (queries, mutations)
    pages/                  # Application pages
    stores/                 # Global state (Jotai)
```

## Getting Started

### Prerequisites
- Node.js 18+

### Setup

```bash
npm install
npm run dev                 # starts in development mode (Electron + Vite)
```

### Build

```bash
npm run build               # generates executable for the current platform
```