```markdown
<p align="center">
  <img src="assets/banner.png" alt="Harpa — AI Synthesis Binder" width="100%" style="border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.4);" />
</p>

<div align="center">

# Harpa — AI Synthesis Binder

**A local-first research cockpit and publication binder for AI-assisted minds.**  
*Compile messy LLM derivations, complex KaTeX formulas, vector diagrams, and source code into archival-grade A4 research volumes.*

[![Platform](https://img.shields.io/badge/Platform-Windows%20x64-0078D6?style=flat-square&logo=windows&logoColor=white)](https://github.com/Velocity07/Harpa/releases)
[![Runtime](https://img.shields.io/badge/Runtime-Tauri%20%2F%20Rust-f5a97f?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app)
[![Frontend](https://img.shields.io/badge/Stack-React%2018%20%7C%20TypeScript%20%7C%20Zustand-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://react.dev)
[![Engine](https://img.shields.io/badge/Typography-KaTeX%20%7C%20Mermaid%20SVG-00d084?style=flat-square)](https://katex.org)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-1f2328.svg?style=flat-square)](LICENSE)

</div>

---

## The Philosophy

Modern AI models excel at generating rich technical output: multi-variable tensor equations, Mermaid architecture diagrams, code implementations, and comparative benchmarks. 

Standard note-taking applications break this output:
* Google Docs mangles LaTeX and scrambles indentation.
* Notion and web tools clip wide tables and rasterize diagrams into low-resolution images.
* Standard browser print engines slice code blocks in half across page margins.

**Harpa** is an indie, local-first synthesis cockpit engineered to bridge this gap. It captures raw, unstructured AI output and lets you curate, restructure, and export it into publication-grade multi-chapter A4 documents without layout degradation.

---

## Core Capabilities

### ⚡ Rapid-Ingest Pipeline
Capture thoughts without breaking focus. Paste raw AI Markdown directly into the fast-ingestion buffer and press `Ctrl + Enter`. Harpa parses code fences, math blocks, and vector strings into indexed research cards instantly.

### 📐 Uncompromising Mathematical Typography
Powered by an isolated KaTeX rendering engine. Complex tensor equations, matrix operators ($\mathbf{W}_p \in \mathbb{R}^{d \times k}$), multi-line derivations, and limit notations render with textbook-level typography without clipping or collapsing into prose.

### 📊 Pure Vector Diagramming
Embedded Mermaid flowcharts and system topologies render as native vector SVG paths and pure text nodes. When printed or exported to PDF, diagrams remain sharp at any zoom level without `<foreignObject>` PDF export clipping.

### 📖 Publication-Grade Book Engine
A dedicated multi-chapter compilation layout engineered specifically for print:
* **Automated Front-Matter:** Generates formal Cover Pages and dynamic Tables of Contents with chapter metrics.
* **Orphan-Resistant Pagination:** Custom `@media print` rules prevent Chromium from slicing code blocks, matrices, or diagram cards across page breaks.
* **Editorial Themes:** Switch between Ivory Parchment, Minimalist Editorial Serif, and Slate Monochrome with unified typography.

### 🔒 100% Local-First & Zero Telemetry
Your research stays yours. Harpa runs entirely offline using a lightweight Tauri (Rust) shell and local disk persistence. No remote databases, no tracking pixels, and no vendor lock-in. Back up or restore your entire library as raw JSON or standard Markdown at any time.

---

## Installation (Windows)

Pre-compiled standalone binaries are available on the [Releases](https://github.com/Velocity07/Harpa/releases) page.

1. Download **`Harpa_1.0.1_x64-setup.exe`** from the latest release.
2. Run the installer to set up Harpa on your machine.
3. Launch Harpa from your Start Menu.

> **Note on Windows SmartScreen:**  
> Because Harpa is an independent release without an EV code signing certificate, Windows Defender SmartScreen may display an *"Unrecognized app"* notice. Click **More info** → **Run anyway** to proceed.

---

## Architecture & Tech Stack

```mermaid
graph LR
    subgraph Frontend [React 18 Desktop Client]
        UI[Workspace & Editor UI]
        Store[(Zustand Persistent Store)]
        AST[Unified Markdown AST Engine]
        Katex[KaTeX Display Engine]
        Mermaid[Native SVG Renderer]
    end

    subgraph Native [Tauri Native Host]
        Rust[Rust Core Runtime]
        IPC[Zero-Latency IPC Bridge]
        FS[Local Disk & File System]
    end

    UI --> Store
    Store --> AST
    AST --> Katex
    AST --> Mermaid
    UI <--> IPC
    IPC <--> Rust
    Rust <--> FS

```

* **Desktop Host:** [Tauri](https://tauri.app) (Rust runtime; sub-40MB memory footprint).
* **UI Layer:** React 18, TypeScript, Tailwind CSS, Lucide Icons.
* **State Management:** Zustand with local disk persistence and non-blocking indexing.
* **AST & Processing:** Remark/Rehype AST pipelines, Prism syntax highlighting, KaTeX, and native Mermaid SVG rendering.

---

## Building from Source

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or newer)
* [Rust & Cargo](https://rustup.rs/) (v1.75 or newer)
* C++ Build Tools for Windows (via Visual Studio Installer)

### Development Setup

```bash
# 1. Clone the repository
git clone [https://github.com/Velocity07/Harpa.git](https://github.com/Velocity07/Harpa.git)
cd Harpa

# 2. Install dependencies
npm install

# 3. Launch desktop app in development mode
npm run tauri dev

```

### Production Packaging

To compile an optimized native `.exe` installer:

```bash
npm run tauri build

```

The compiled installer will be generated in `src-tauri/target/release/bundle/nsis/`.

---

## License

Distributed under the **GNU Affero General Public License v3 (AGPLv3)**. See [`LICENSE`](LICENSE) for details. Built to remain open, transparent, and resilient.
